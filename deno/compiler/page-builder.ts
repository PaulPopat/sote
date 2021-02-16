import { PagesModel, TpeFile } from "../types/app.ts";
import { Iterate } from "../util/array.ts";
import { ParseTpeFile } from "./tpe-file-parser.ts";
import { NotUndefined } from "../util/object.ts";
import { StdComponents } from "../std-components.ts";
import { GetUsed } from "./tpe-component-applier.ts";

type TpeFileModel = {
  path: string;
  text: string;
  local_path: string;
};

export async function CompileApp(
  pages_files: AsyncGenerator<TpeFileModel>,
  components_files: AsyncGenerator<TpeFileModel>
): Promise<PagesModel> {
  const user_components = (
    await Iterate(components_files)
      .Select(async (f) => {
        try {
          return {
            data: await ParseTpeFile(f.text, f.local_path),
            url: f.path,
          };
        } catch (err) {
          console.log("Failed to parse component " + f.path + " error below:");
          console.error(err);

          return undefined;
        }
      })
      .WhereIs(NotUndefined)
      .ToArray()
  ).reduce(
    (c, n) => ({
      ...c,
      [n.url.replace("/", "").replace(/[\/\\]/gm, "::")]: n.data,
    }),
    {} as Record<string, TpeFile>
  );

  for (const component in user_components) {
    console.log("Adding component " + component + " to the component list.");
  }

  const components = { ...StdComponents, ...user_components };
  let css_bundle = "";
  let js_bundle = "";
  let included = [] as string[];
  const bundler: Record<string, (() => void)[]> = {};
  const full = await Iterate(pages_files)
    .Select(async (f) => {
      try {
        return {
          model: await ParseTpeFile(f.text, f.local_path),
          url: f.path,
        };
      } catch (err) {
        console.log("Failed to parse page " + f.path + " error below:");
        console.error(err);

        return undefined;
      }
    })
    .WhereIs(NotUndefined)
    .Select(({ model, url }) => ({
      url,
      model: {
        ...model,
        used: GetUsed(model.xml_template, components),
      },
    }))
    .ToArray();
  const pages = await Iterate(full)
    .Select(async ({ url, model }) => {
      let add = [] as TpeFile[];
      for (const include of model.used) {
        if (included.find((i) => i === include)) {
          continue;
        }

        const component = components[include];
        if (!component) {
          throw new Error("Cannot find component");
        }

        const total = full.filter(
          (f) => f.model.used.find((c) => c === include) != null
        ).length;
        if (total > full.length * 0.8) {
          included = [...included, include];
          if (component.css?.trim() && component.css.trim() !== "undefined") {
            css_bundle += "\n" + component.css;
          }

          if (component.client_js?.trim()) {
            js_bundle += "\n" + component.client_js;
          }
        } else {
          add = [...add, component];
        }
      }

      return {
        url,
        model: {
          ...model,
          xml_template: model.xml_template,
          client_js: add.reduce(
            (c, n) => (c ?? "") + (n.client_js ?? ""),
            model.client_js ?? ""
          ),
          css: add.reduce((c, n) => (c ?? "") + (n.css ?? ""), model.css ?? ""),
          used: undefined,
        },
      };
    })
    .Select((page) => {
      if (!page.model.title) {
        throw new Error(`Page ${page.url} does not have a title`);
      }

      if (!page.model.description) {
        throw new Error(`Page ${page.url} does not have a description`);
      }

      if (Object.keys(page.model.server_js).find((s) => s !== "get")) {
        console.log(
          `There are redirected handlers for ${page.url}. These handlers use cookies to perform the GET redirect (stopping resubmission on page refresh). Make sure you have a valid cookie notice on your site for these handlers.`
        );
      }

      return {
        ...page,
        model: {
          ...page.model,
          server_js: {
            ...page.model.server_js,
            get: page.model.server_js.get || "return query",
          },
          client_js: page.model.client_js,
          css: page.model.css,
          title: page.model.title ?? "",
          description: page.model.description ?? "",
        },
      };
    })
    .ToArray();

  return {
    pages: await Promise.all(
      pages.map(async (p) => ({
        ...p,
        model: { ...p.model, css: p.model.css },
      }))
    ),
    css_bundle,
    js_bundle,
    components,
  };
}
