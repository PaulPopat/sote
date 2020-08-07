import convert from "xml-js";
import xmlescape from "xml-escape";
import { TransformKeys, TransformProperties } from "../utils/object";

export type XmlElement = {
  tag: string;
  attributes: NodeJS.Dict<string>;
  children: XmlNode[];
};

export type XmlText = {
  text: string;
};

export type XmlNode = XmlElement | XmlText;

export function IsText(e: XmlNode): e is XmlText {
  return "text" in e;
}

export function IsElement(e: XmlNode): e is XmlElement {
  return "tag" in e;
}

function Reduce(parsed: convert.Element): XmlNode {
  if (parsed.type === "text") {
    return { text: parsed.text?.toString().trim() ?? "" };
  }

  return {
    tag: parsed.name ?? "",
    attributes: TransformProperties(
      TransformKeys(parsed.attributes ?? {}, (k) => k.replace("@_", "")),
      (a) => a.toString()
    ),
    children: parsed.elements?.map(Reduce) ?? [],
  };
}

export function ParseXml(xml: string): Promise<XmlNode[]> {
  const parsed = convert.xml2js(
    `<?xml version="1.0" encoding="utf-8"?><body>${xml}</body>`,
    { compact: false }
  );
  return parsed.elements[0]?.elements?.map(Reduce) ?? [];
}

function WriteNode(node: XmlNode): string {
  if (IsText(node)) {
    return xmlescape(node.text);
  }

  let result = "<" + node.tag;
  if (Object.keys(node.attributes).length > 0) {
    result = Object.keys(node.attributes).reduce(
      (c, n) => c + ` ${n}="${xmlescape(node.attributes[n] ?? "")}"`,
      result
    );
  }

  if (!node.children.length) {
    return result + "/>";
  }

  return (
    result + ">" + node.children.map(WriteNode).join("") + "</" + node.tag + ">"
  );
}

export function ToXml(nodes: XmlNode[]) {
  return nodes.map(WriteNode).join("");
}
