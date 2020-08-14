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

function* SplitXml(xml: string) {
  let current = "";
  let expressionDepth = 0;
  for (const char of xml) {
    if (char === "{") {
      expressionDepth += 1;
    } else if (char === "}") {
      expressionDepth -= 1;
    }

    if (char === "<" && !expressionDepth) {
      if (current) {
        yield current;
      }

      current = char;
      continue;
    }

    if (char === ">" && !expressionDepth) {
      current += char;
      if (current) {
        yield current;
      }

      current = "";
      continue;
    }

    current += char;
  }
}

function* SplitTag(tag: string) {
  let current = "";
  let instring = "";
  for (const char of tag) {
    if (!char.trim() && !instring) {
      if (current) {
        yield current;
      }

      current = "";
      continue;
    }

    if (char === "<" && !instring) {
      current += char;
      yield current;
      current = "";
      continue;
    }

    if (char === "/" && !instring) {
      if (current) {
        yield current;
      }

      current = char;
      continue;
    }

    if (char === ">" && !instring) {
      if (current === "/") {
        current += char;
        yield current;
        current = "";
        continue;
      }

      if (current) {
        yield current;
      }

      yield char;
      current = "";
    }

    if (char === '"' || char === "'") {
      if (instring === char) {
        instring = "";
      } else if (!instring) {
        instring = char;
      }
    }

    current += char;
  }
}

function ParseAttribute(attribute: string) {
  const [name, value] = attribute.split("=");
  return { name, value: value.substr(1, value.length - 2) };
}

function UntilClosingTag(
  iterator: Generator<string, void, unknown>,
  tag: string
) {
  let next = iterator.next();
  let result = "";
  while (!next.done) {
    if (next.value.startsWith("</") && next.value.includes(tag)) {
      return result.trim();
    }

    result += next.value;
    next = iterator.next();
  }

  return result.trim();
}

function Internal(iterator: Generator<string, void, unknown>) {
  const result: XmlNode[] = [];
  let next = iterator.next();
  while (!next.done) {
    const segment = next.value;
    if (segment.startsWith("</")) {
      return result;
    } else if (segment.startsWith("<")) {
      const [_, tag, ...a] = SplitTag(segment);
      const end = a[a.length - 1];
      const attributes = a.slice(0, a.length - 1).map(ParseAttribute);
      if (tag === "style" || tag === "script") {
        const data = UntilClosingTag(iterator, tag);
        result.push({
          tag,
          attributes: attributes.reduce(
            (c, n) => ({ ...c, [n.name]: n.value }),
            {} as NodeJS.Dict<string>
          ),
          children: [{ text: data }],
        });
      } else {
        result.push({
          tag,
          attributes: attributes.reduce(
            (c, n) => ({ ...c, [n.name]: n.value }),
            {} as NodeJS.Dict<string>
          ),
          children: end !== "/>" ? Internal(iterator) : [],
        });
      }
    } else {
      const text = segment.trim();
      if (text) {
        result.push({ text });
      }
    }

    next = iterator.next();
  }

  return result;
}

export function ParseXml(xml: string): XmlNode[] {
  const iterator = SplitXml(xml);
  return Internal(iterator);
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
