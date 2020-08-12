import { XmlNode, IsText } from "./xml-parser";
import { TpeFile } from "./tpe-file-parser";
import { TransformProperties } from "../utils/object";
import { GetExpressions } from "../utils/html";

type ApplierContext = {
  children: XmlNode[];
  props: NodeJS.Dict<string>;
};

function ReduceText(node: string, props: NodeJS.Dict<string>) {
  if (!node) {
    return node;
  }

  let text = node;
  for (const expression of GetExpressions(text)) {
    text = text.replace(expression, TransformStatement(expression, props));
  }

  return text;
}

function TransformStatement(statement: string, props: NodeJS.Dict<string>) {
  let result = statement;
  for (const key in props) {
    let value = props[key];
    if (value?.startsWith(":")) {
      value = value.replace(":", "");
    } else {
      value = "'" + value + "'";
    }

    result = result.replace(
      new RegExp(`props\\s*\\.\\s*${key}`, "gm"),
      "(" + value + ")"
    );
  }

  return result;
}

function internal(
  tpe: XmlNode[],
  components: NodeJS.Dict<TpeFile>,
  used: string[],
  context: ApplierContext
): XmlNode[] {
  return tpe.flatMap((n) => {
    if (IsText(n)) {
      return { ...n, text: ReduceText(n.text, context.props) };
    }

    if (n.tag === "children") {
      return context.children;
    }

    const component = components[n.tag];
    if (component) {
      used.push(n.tag);
      return internal(component.xml_template, components, used, {
        children: internal(n.children, components, used, context),
        props: n.attributes,
      });
    }

    return {
      ...n,
      attributes: TransformProperties(n.attributes, (p) =>
        TransformStatement(p, context.props)
      ),
      children: internal(n.children, components, used, context),
    };
  });
}

export function ApplyComponents(
  tpe: XmlNode[],
  components: NodeJS.Dict<TpeFile>
): { tpe: XmlNode[]; components: string[] } {
  const used = [] as string[];
  const result = internal(tpe, components, used, { children: [], props: {} });

  return {
    tpe: result,
    components: used.filter((item, i, ar) => ar.indexOf(item) === i),
  };
}
