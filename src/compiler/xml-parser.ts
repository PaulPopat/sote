import xmlescape from "xml-escape";

const self_closing_tags = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
  "command",
  "keygen",
  "menuitem",
];

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
  let expression_depth = 0;
  let whitespace_count = 0;
  let in_script = false;

  const is_script_start = (expression: string) =>
    expression.match(/<\s*script/) || expression.match(/<\s*style/);

  const is_script_end = (expression: string) =>
    expression.match(/<\/\s*script/) || expression.match(/<\/\s*style/);

  for (const char of xml.replace(/<!--(.|\n)*-->/gm, "")) {
    if (char === "{") {
      expression_depth += 1;
      whitespace_count = 0;
    } else if (char === "}") {
      expression_depth -= 1;
    }

    if (char === "<" && !expression_depth) {
      if (current) {
        yield current;
      }

      current = char;
      continue;
    }

    if (char === ">" && !expression_depth) {
      current += char;
      if (current) {
        if (in_script && is_script_end(current)) {
          in_script = false;
        } else if (!in_script && is_script_start(current)) {
          in_script = true;
        }

        yield current;
      }

      current = "";
      continue;
    }

    if (!char.trim() && !expression_depth && !in_script) {
      whitespace_count += 1;
      if (whitespace_count === 1) {
        current += " ";
      }

      continue;
    } else if (char.trim()) {
      whitespace_count = 0;
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
  const [name, ...value] = attribute.split("=");
  const joined = value.join("=");
  return { name, value: joined.substr(1, joined.length - 2) };
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

const open_swap = {
  EMAIL_IS_MSO: "<!--[if mso]",
  EMAIL_NOT_MSO: "<!--[if !mso]><!--",
} as NodeJS.Dict<string>;

const close_swap = {
  EMAIL_IS_MSO: "<![endif]-->",
  EMAIL_NOT_MSO: "<!--<![endif]-->",
} as NodeJS.Dict<string>;

function WriteNode(node: XmlNode): string {
  if (IsText(node)) {
    return xmlescape(node.text);
  }

  let result = open_swap[node.tag] || "<" + node.tag;
  if (Object.keys(node.attributes).length > 0) {
    result = Object.keys(node.attributes).reduce(
      (c, n) => c + ` ${n}="${xmlescape(node.attributes[n] ?? "")}"`,
      result
    );
  }

  if (!node.children.length) {
    if (self_closing_tags.find(t => t === node.tag)) {
      return result + "/>";
    }

    return `${result}></${node.tag}>`;
  }

  return (
    result +
    ">" +
    node.children.map(WriteNode).join("") +
    (close_swap[node.tag] || "</" + node.tag + ">")
  );
}

export function ToXml(nodes: XmlNode[]) {
  return nodes.map(WriteNode).join("");
}
