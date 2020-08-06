import parser from "fast-xml-parser";
import xmlescape from "xml-escape";
import { IsString, IsArray } from "@paulpopat/safe-type";
import { TransformKeys } from "../utils/object";

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

function Reduce(parsed: any): XmlNode[] {
  return Object.keys(parsed)
    .flatMap((k) =>
      IsArray(IsString)(parsed[k])
        ? parsed[k].map((t: string) => ({
            tag: k,
            attributes: {},
            children: [{ text: t }],
          }))
        : k === "attributes"
        ? // Eeewww!!!
          ((undefined as any) as XmlNode)
        : k === "#text"
        ? { text: parsed[k] }
        : {
            tag: k,
            attributes: parsed[k].attributes
              ? TransformKeys(
                  parsed[k].attributes as NodeJS.Dict<string>,
                  (k) => k.replace("@_", "")
                )
              : {},
            children:
              IsString(parsed[k]) && parsed[k]
                ? [{ text: parsed[k] }]
                : typeof parsed[k] === "object"
                ? Reduce(parsed[k])
                : [],
          }
    )
    .filter((r) => r);
}

export function ParseXml(xml: string): XmlNode[] {
  const parsed = parser.parse(xml, {
    attrNodeName: "attributes",
    textNodeName: "#text",
    ignoreAttributes: false,
    ignoreNameSpace: true,
    parseNodeValue: true,
    trimValues: true,
    parseTrueNumberOnly: false,
    arrayMode: false,
  });
  const json = JSON.stringify(parsed);
  return Reduce(parsed);
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
