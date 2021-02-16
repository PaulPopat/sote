import { ParseXml } from "./xml-parser.ts";
import { CompileCss } from "./css-manipulator.ts";
import { ApplySpecifier } from "./tpe-manipulator.ts";
import { TransformJs } from "./javascript-compiler.ts";
import { Iterate } from "../util/array.ts";
import { IsXmlElement, IsXmlText, XmlElement, XmlText } from "../types/app.ts";

type XmlScript = {
  tag: string;
  attributes: { method: string };
  children: [XmlText];
};

function ValidText(e: XmlElement): e is XmlScript {
  return e.children.length === 1 && IsXmlText(e.children[0]);
}

export async function ParseTpeFile(tpe: string, working_dir: string) {
  const xml_model = ParseXml(tpe);
  const find = (tag: string, attributes: Record<string, string>) =>
    xml_model.filter((n) => {
      if (IsXmlElement(n)) {
        return (
          n.tag === tag &&
          Object.keys(attributes).find(
            (k) => n.attributes[k] !== attributes[k]
          ) == null
        );
      }

      return false;
    }) as XmlElement[];

  const get_text_script = async (
    tag: string,
    attributes: Record<string, string>,
    allow_multiple: boolean
  ) => {
    const elements = find(tag, attributes);
    if (elements.length === 0) {
      return undefined;
    }

    const id_text = [
      ...Object.keys(attributes).map((k) => attributes[k]),
      tag,
    ].join(" ");

    if (elements.length > 1 && !allow_multiple) {
      throw new Error(`More than one ${id_text} element`);
    }

    return (
      await Iterate(elements)
        .Select(async (e, i) => {
          const build_string = (text: string) =>
            typeof e.attributes["no-hash"] === "string"
              ? "/* DATA: NO_HASH */" + text + "/* DATA: END_NO_HASH */"
              : typeof e.attributes["bundle"] === "string"
              ? TransformJs(text, working_dir)
              : text;
          if (e.attributes.src) {
            return build_string(await Deno.readTextFile(e.attributes.src));
          }

          if (!ValidText(e)) {
            throw new Error(`${id_text} ${i} is not a valid script`);
          }

          return build_string(e.children[0].text);
        })
        .ToArray()
    ).join("\n");
  };

  const xml_template = find("template", {});
  if (xml_template.length !== 1) {
    throw new Error("No xml template in TPE file");
  }

  const server_js_e = find("script", { area: "server" }).filter(ValidText);
  const css_text = await get_text_script("style", {}, true);
  const { css, hash } = CompileCss(css_text);
  return {
    xml_template: hash
      ? ApplySpecifier(xml_template[0].children, hash)
      : xml_template[0].children,
    server_js: server_js_e.reduce(
      (c, n) => ({
        ...c,
        [n.attributes.method ?? "get"]: n.children[0].text,
      }),
      {} as Record<string, string>
    ),
    client_js: await get_text_script("script", { area: "client" }, true),
    css: css,
    title: await get_text_script("title", {}, false),
    description: await get_text_script("description", {}, false),
    language: await get_text_script("lang", {}, false),
  };
}
