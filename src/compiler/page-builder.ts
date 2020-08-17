import UglifyJS from "uglify-js";
import UglifyCss from "uglifycss";
import postcss from "postcss";
import autoprefixer from "autoprefixer";
import { ParseTpeFile, TpeFile } from "./tpe-file-parser";
import { ApplyComponents, AppliedXmlNode } from "./tpe-component-applier";
import { NotUndefined } from "../utils/object";
import { StdComponents } from "../std-components";

type PageModel = {
  server_js: NodeJS.Dict<string>;
  client_js: string;
  xml_template: AppliedXmlNode[];
  css: string;
  title: string;
  description: string;
};

export type PagesModel = {
  pages: { url: string; model: PageModel }[];
  css_bundle: string;
  js_bundle: string;
};

type TpeFileModel = {
  path: string;
  text: string;
};

function MinifyJs(js: string, url: string) {
  try {
    const result = UglifyJS.minify(js);
    if (result.error) {
      console.log(`Failed to minify JS for ${url}. See error below.`);
      console.error(result.error);
      console.log("Continueing with unminified version");
      return js;
    }

    return result.code;
  } catch (err) {
    console.log(`Failed to minify JS for ${url}. See error below.`);
    console.error(err);
    console.log("Continueing with unminified version");
    return js;
  }
}

function MinifyCss(css: string, url: string) {
  try {
    return UglifyCss.processString(css, { maxLineLen: 500 });
  } catch (err) {
    console.log(`Failed to minify CSS for ${url}. See error below.`);
    console.error(err);
    console.log("Continueing with unminified version");
    return css;
  }
}

function PrefixCss(css: string) {
  return new Promise<string>((res, rej) => {
    postcss([autoprefixer])
      .process(css)
      .then((result) => {
        result.warnings().forEach((warn) => {
          console.warn(warn.toString());
        });

        res(result.css);
      });
  });
}

export async function CompileApp(
  pages_files: TpeFileModel[],
  components_files: TpeFileModel[],
  production: boolean
): Promise<PagesModel> {
  const user_components = components_files
    .map((f) => {
      try {
        return { data: ParseTpeFile(f.text), url: f.path };
      } catch (err) {
        console.log("Failed to parse component " + f.path + " error below:");
        console.error(err);

        return undefined;
      }
    })
    .filter(NotUndefined)
    .reduce(
      (c, n) => ({
        ...c,
        [n.url.replace("/", "").replace(/[\/\\]/gm, "::")]: n.data,
      }),
      {} as NodeJS.Dict<TpeFile>
    );

  for (const component in user_components) {
    console.log("Adding component " + component + " to the component list.");
  }

  const components = { ...StdComponents, ...user_components };
  let css_bundle = "";
  let js_bundle = "";
  let included = [] as string[];
  const pages = pages_files
    .map((f) => {
      try {
        return { model: ParseTpeFile(f.text), url: f.path };
      } catch (err) {
        console.log("Failed to parse page " + f.path + " error below:");
        console.error(err);

        return undefined;
      }
    })
    .filter(NotUndefined)
    .map(({ model, url }) => ({
      url,
      model: {
        ...model,
        xml_template: ApplyComponents(model.xml_template, components),
      },
    }))
    .map(({ url, model }, _, full) => {
      let add = [] as TpeFile[];
      for (const include of model.xml_template.components) {
        if (included.find((i) => i === include)) {
          continue;
        }

        const component = components[include];
        if (!component) {
          throw new Error("Cannot find component");
        }

        const total = full.filter((f) =>
          f.model.xml_template.components.find((c) => c === include)
        ).length;
        if (total > full.length * 0.8) {
          included = [...included, include];
          if (component.css?.trim() && component.css.trim() !== "undefined") {
            css_bundle +=
              "\n" +
              (production ? MinifyCss(component.css, include) : component.css);
          }

          if (component.client_js?.trim()) {
            js_bundle +=
              "\n" +
              (production
                ? MinifyJs(component.client_js, include)
                : component.client_js);
          }
        } else {
          add = [...add, component];
        }
      }

      return {
        url,
        model: {
          ...model,
          xml_template: model.xml_template.tpe,
          client_js: add.reduce(
            (c, n) => (c ?? "") + (n.client_js ?? ""),
            model.client_js && production
              ? MinifyJs(model.client_js, url)
              : model.client_js ?? ""
          ),
          css: add.reduce(
            (c, n) => (c ?? "") + (n.css ?? ""),
            model.css && production
              ? MinifyCss(model.css, url)
              : model.css ?? ""
          ),
        },
      };
    })
    .map((page) => {
      if (!page.model.title) {
        throw new Error(`Page ${page.url} does not have a title`);
      }

      if (!page.model.description) {
        throw new Error(`Page ${page.url} does not have a description`);
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
    });

  return {
    pages: await Promise.all(
      pages.map(async (p) => ({
        ...p,
        model: { ...p.model, css: await PrefixCss(p.model.css) },
      }))
    ),
    css_bundle: await PrefixCss(css_bundle),
    js_bundle: js_bundle,
  };
}
