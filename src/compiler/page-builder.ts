import { XmlNode } from "./xml-parser";
import { ParseTpeFile, TpeFile } from "./tpe-file-parser";
import { ApplyComponents } from "./tpe-component-applier";
import UglifyJS from "uglify-js";
import UglifyCss from "uglifycss";

type PageModel = {
  server_js: NodeJS.Dict<string>;
  client_js: string;
  xml_template: XmlNode[];
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
  const result = UglifyJS.minify(js);
  if (result.error) {
    console.log(`Failed to minify JS for ${url}. See error below.`);
    console.error(result.error);
    return js;
  }

  return result.code;
}

function MinifyCss(css: string) {
  return UglifyCss.processString(css, { maxLineLen: 500 });
}

export function CompileApp(
  pages_files: TpeFileModel[],
  components_files: TpeFileModel[],
  production: boolean
) {
  const components = components_files
    .map((f) => ({ data: ParseTpeFile(f.text), url: f.path }))
    .reduce(
      (c, n) => ({
        ...c,
        [n.url.replace("/", "").replace(/\//gm, "::")]: n.data,
      }),
      {} as NodeJS.Dict<TpeFile>
    );

  let css_bundle = "";
  let js_bundle = "";
  let included = [] as string[];
  const pages = pages_files
    .map((f) => ({ model: ParseTpeFile(f.text), url: f.path }))
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

        if (
          full.filter((f) =>
            f.model.xml_template.components.find((c) => c === include)
          ).length >
          full.length * 0.8
        ) {
          if (component.css?.trim() && component.css.trim() !== "undefined") {
            css_bundle += "\n" + component.css;
          }

          if (component.client_js?.trim() && component.client_js.trim() !== "undefined") {
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
          xml_template: model.xml_template.tpe,
          client_js:
            model.client_js + add.reduce((c, n) => c + (n.client_js ?? ""), ""),
          css: model.css + add.reduce((c, n) => c + (n.css ?? ""), ""),
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
          client_js:
            production && page.model.client_js.trim() !== "undefined"
              ? MinifyJs(page.model.client_js, page.url)
              : page.model.client_js.trim() === "undefined"
              ? ""
              : page.model.client_js,
          css:
            production && page.model.css.trim() !== "undefined"
              ? MinifyCss(page.model.css)
              : page.model.css.trim() === "undefined"
              ? ""
              : page.model.css,
        },
      };
    });

  return {
    pages: pages,
    css_bundle:
      production && css_bundle.trim() !== "undefined"
        ? MinifyCss(css_bundle)
        : css_bundle.trim() === "undefined"
        ? ""
        : css_bundle,
    js_bundle:
      production && js_bundle.trim() !== "undefined"
        ? MinifyJs(js_bundle, "Bundle")
        : js_bundle.trim() === "undefined"
        ? ""
        : js_bundle,
  };
}