import { XmlNode, IsText } from "../compiler/xml-parser";
import { GetExpressions } from "../utils/html";
import { Evaluate } from "../utils/evaluate";
import { TransformProperties } from "../utils/object";
import { IsString } from "@paulpopat/safe-type";
import { AppliedXmlNode } from "../compiler/tpe-component-applier";

function GetProps(props: any, path: NodeJS.Dict<string>[]) {
  return path.reduce(
    (c, n) =>
      TransformProperties(n, (e) =>
        e.startsWith(":")
          ? Evaluate(e.replace(":", ""), [{ name: "props", value: c }])
          : e
      ),
    props
  );
}

type Params = {
  name: string;
  value: any;
}[];

function ReduceText(node: string, props: any, params: Params) {
  if (!node) {
    return node;
  }

  let text = node;
  for (const expression of GetExpressions(text)) {
    text = text.replace(
      `{${expression}}`,
      Evaluate(expression, [{ name: "props", value: props }, ...params])
    );
  }

  return text;
}

function Internal(
  tpe: AppliedXmlNode[],
  props: any,
  params: Params
): XmlNode[] {
  return tpe.flatMap((n) => {
    const inner_props = GetProps(props, n.props);
    if (IsText(n)) {
      return [{ text: ReduceText(n.text, inner_props, params) } as XmlNode];
    }

    const attributes = TransformProperties(n.attributes, (p) =>
      p.startsWith(":")
        ? Evaluate(p.replace(":", ""), [
            { name: "props", value: inner_props },
            ...params,
          ])
        : p
    );

    if (n.tag === "for") {
      const subject = attributes.subject;
      const key = attributes.key;
      if (!Array.isArray(subject) || !IsString(key)) {
        throw new Error(
          "Trying to build a for loop without an array as the subject and a string as the key"
        );
      }

      return subject.flatMap((s) =>
        Internal(n.children, props, [...params, { name: key, value: s }])
      );
    }

    if (n.tag === "if") {
      const check = attributes.check;
      if (check) {
        return Internal(n.children, props, params);
      } else {
        return [];
      }
    }

    return [
      {
        ...n,
        attributes,
        children: Internal(n.children, props, params),
      } as XmlNode,
    ];
  });
}

export function BuildTpe(tpe: AppliedXmlNode[], props: any): XmlNode[] {
  return Internal(tpe, props, []);
}
