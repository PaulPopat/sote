import {
  ParseXml,
  XmlNode,
  IsElement,
  XmlElement,
  IsText,
  XmlText,
} from "./xml-parser";
import { CompileCss } from "./css-manipulator";
import crypto from "crypto";
import { ApplySpecifier } from "./tpe-manipulator";

export type TpeFile = {
  server_js?: NodeJS.Dict<string>;
  client_js?: string;
  xml_template: XmlNode[];
  css?: string;
  title?: string;
};

type XmlScript = {
  tag: string;
  attributes: { method?: string };
  children: [XmlText];
};

function ValidText(e: XmlElement): e is XmlScript {
  return e.children.length === 1 && IsText(e.children[0]);
}

export function ParseTpeFile(tpe: string) {
  const xml_model = ParseXml(tpe);
  const find = (tag: string, attributes: NodeJS.Dict<string>) =>
    xml_model.filter((n) =>
      IsElement(n)
        ? n.tag === tag &&
          Object.keys(attributes).find(
            (k) => n.attributes[k] !== attributes[k]
          ) == null
        : false
    ) as XmlElement[];

  const get_text_script = (tag: string, attributes: NodeJS.Dict<string>) => {
    const elements = find(tag, attributes);
    if (elements.length === 0) {
      return undefined;
    }

    const id_text = [
      ...Object.keys(attributes).map((k) => attributes[k]),
      tag,
    ].join(" ");
    if (elements.length !== 1) {
      throw new Error(`More than one ${id_text} element`);
    }

    const element = elements[0];
    if (!ValidText(element)) {
      throw new Error(`${id_text} is not a valid script`);
    }

    return element.children[0].text;
  };

  const xml_template = find("template", {});
  if (xml_template.length !== 1) {
    throw new Error("No xml template in TPE file");
  }

  const server_js_e = find("script", { area: "server" }).filter(ValidText);
  const css = get_text_script("style", {});
  const css_hash = css
    ? crypto.createHash("md5").update(css).digest("hex")
    : "";
  return {
    xml_template: css
      ? ApplySpecifier(xml_template[0].children, css_hash)
      : xml_template[0].children,
    server_js: server_js_e.reduce(
      (c, n) => ({
        ...c,
        [n.attributes.method ?? "get"]: n.children[0].text,
      }),
      {} as NodeJS.Dict<string>
    ),
    client_js: get_text_script("script", { area: "client" }),
    css: css ? CompileCss(css, css_hash) : undefined,
    title: get_text_script("title", {}),
    description: get_text_script("description", {}),
  };
}
