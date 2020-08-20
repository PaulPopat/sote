import { PagesModel } from "../compiler/page-builder";
import xmlescape from "xml-escape";
import { BuildTpe } from "./tpe-builder";
import { ToXml } from "../compiler/xml-parser";
import { Options } from "../file-system";
import { RemoveUrlParameters } from "../utils/url";

export async function BuildPage(
  page: PagesModel["pages"][number],
  bundle_js: string,
  bundle_css: string,
  props: any,
  context: any,
  options: Options
) {
  return [
    `<!DOCTYPE html>`,
    `<html${options.lang ? ` lang="${xmlescape(options.lang)}"` : ""}${
      options.email
        ? ` xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"`
        : ``
    }>`,
    `<head>`,
    `<meta charset="utf-8" />`,
    `<title>${xmlescape(page.model.title)}</title>`,
    `<meta name="description" content="${xmlescape(page.model.description)}"/>`,
    options.author ? `<meta name="author" content="${options.author}"/>` : "",
    ...(options.email
      ? [
          `<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->`,
          '<meta http-equiv="X-UA-Compatible" content="IE=edge"/>',
          '<meta name="viewport" content="width=device-width,initial-scale=1"/>',
          '<meta name="x-apple-disable-message-reformatting"/>',
          '<meta name="color-scheme" content="light dark"/>',
          '<meta name="supported-color-schemes" content="light dark"/>',
        ]
      : [
          `<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>`,
        ]),
    ...(options.favicon
      ? options.favicon.map(
          (f) => `<link rel="icon" href="${f.path}" sizes="${f.size}"/>`
        )
      : []),

    ...(options.behavior_in_tag
      ? [
          page.model.css
            ? `<style type="text/css">${page.model.css}</style>`
            : "",
          bundle_css ? `<style type="text/css">${bundle_css}</style>` : "",
        ]
      : [
          page.model.css
            ? `<link rel="stylesheet" type="text/css" href="/css${RemoveUrlParameters(
                page.url
              )}.css"></link>`
            : "",
          bundle_css
            ? `<link rel="stylesheet" type="text/css" href="/css/index.bundle.css"></link>`
            : "",
        ]),
    `</head>`,

    `<body style="margin:0;padding:0;">`,
    ToXml(
      await BuildTpe(page.model.xml_template, page.model.tree, props, context)
    ),
    `</body>`,
    ...(options.behavior_in_tag
      ? [
          bundle_js
            ? `<script type="text/javascript">${bundle_js}</script>`
            : "",
          page.model.client_js
            ? `<script type="text/javascript">${page.model.client_js}</script>`
            : "",
        ]
      : [
          bundle_js
            ? `<script type="text/javascript" src="/js/common.bundle.js"></script>`
            : "",
          page.model.client_js
            ? `<script type="text/javascript" src="/js${RemoveUrlParameters(
                page.url
              )}.js"></script>`
            : "",
        ]),
    `</html>`,
  ].join("");
}
