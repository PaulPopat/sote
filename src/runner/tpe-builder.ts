import { XmlNode, IsText } from "../compiler/xml-parser";
import { GetExpressions } from "../utils/html";
import { Evaluate } from "../utils/evaluate";
import { TransformProperties } from "../utils/object";

function ReduceText(node: string, props: any) {
  if (!node) {
    return node;
  }

  let text = node;
  for (const expression of GetExpressions(text)) {
    text = text.replace(
      `{${expression}}`,
      Evaluate(expression, [{ name: "props", value: props }])
    );
  }

  return text;
}

export function BuildTpe(tpe: XmlNode[], props: any): XmlNode[] {
  return tpe.map((n) => {
    if (IsText(n)) {
      return { text: ReduceText(n.text, props) };
    }

    return {
      ...n,
      attributes: TransformProperties(n.attributes, (p) =>
        p.startsWith(":")
          ? Evaluate(p.replace(":", ""), [{ name: "props", value: props }])
          : p
      ),
      children: BuildTpe(n.children, props),
    };
  });
}
