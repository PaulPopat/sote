import {
  ParseXml,
  XmlNode,
  IsElement,
  XmlElement,
  IsText,
  XmlText,
} from "./xml-parser";

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
  const find = (tag: string) =>
    xml_model.filter((n) =>
      IsElement(n) ? n.tag === tag : false
    ) as XmlElement[];

  const get_text_script = (tag: string) => {
    const elements = find(tag);
    if (elements.length === 0) {
      return undefined;
    }

    if (elements.length !== 1) {
      throw new Error(`More than one ${tag} element`);
    }

    const element = elements[0];
    if (!ValidText(element)) {
      throw new Error(`${tag} is not a valid script`);
    }

    return element.children[0].text;
  };

  const xml_template = find("template");
  if (xml_template.length !== 1) {
    throw new Error("No xml template in TPE file");
  }

  const server_js_e = find("server-js").filter(ValidText);

  return {
    xml_template: xml_template[0].children,
    server_js: server_js_e.reduce(
      (c, n) => ({
        ...c,
        [n.attributes.method ?? "get"]: n.children[0].text,
      }),
      {} as NodeJS.Dict<string>
    ),
    client_js: get_text_script("client-js"),
    css: get_text_script("css"),
    title: get_text_script("title"),
  };
}
