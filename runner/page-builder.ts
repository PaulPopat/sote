import { ToXml, XmlEscape } from "../compiler/xml-parser.ts";
import { PagesModel, TpeFile } from "../types/app.ts";
import { Options } from "../types/config.ts";
import { RemoveUrlParameters } from "../util/url.ts";
import { BuildTpe, ReduceText } from "./tpe-builder.ts";

export async function BuildPage(
  page: PagesModel["pages"][number],
  components: Record<string, TpeFile>,
  bundle_js: string,
  bundle_css: string,
  props: any,
  context: any,
  options: Options,
  can_include_ga: boolean
) {
  const reduce = (text: string) =>
    ReduceText(text, props, [{ name: "context", value: context }]);
  return [
    `<!DOCTYPE html>`,
    `<html${
      options.lang
        ? ` lang="${
            page.model.language
              ? XmlEscape(await reduce(page.model.language))
              : XmlEscape(options.lang)
          }"`
        : ""
    }${
      options.email
        ? ` xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"`
        : ``
    }>`,
    `<head>`,
    `<meta charset="utf-8" />`,
    ...(options.google_tracking_id
      ? [
          `<script async src="https://www.googletagmanager.com/gtag/js?id=${options.google_tracking_id}"></script>`,
          !can_include_ga
            ? `<script>window.GAEnabled=false;function gtag(){dataLayer.push(arguments);}function EnableGA(){window.dataLayer=window.dataLayer||[];gtag('js',new Date());gtag('config','${options.google_tracking_id}');var CookieDate=new Date;CookieDate.setFullYear(CookieDate.getFullYear()+10);document.cookie="track-ga=true;expires="+CookieDate.toUTCString()+";";window.GAEnabled=true;}</script>`
            : `<script>window.dataLayer=window.dataLayer||[];gtag('js',new Date());gtag('config','${options.google_tracking_id}');window.GAEnabled=true;</script>`,
        ]
      : []),
    `<title>${XmlEscape(await reduce(page.model.title))}</title>`,
    `<meta name="description" content="${XmlEscape(
      await reduce(page.model.description)
    )}"/>`,
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
    ToXml(await BuildTpe(page.model.xml_template, components, props, context)),
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
