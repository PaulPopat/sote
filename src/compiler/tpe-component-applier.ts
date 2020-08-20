import { XmlNode, IsText, XmlText, XmlElement } from "./xml-parser";
import { TpeFile } from "./tpe-file-parser";
import { PropsTree, TreeJson } from "./props-tree";

type ApplierContext = {
  children: AppliedXmlNode[];
  props: NodeJS.Dict<string>[];
  used: string[];
  tree:
    | ReturnType<typeof PropsTree>
    | ReturnType<ReturnType<typeof PropsTree>["add"]>;
};

export type AppliedXmlText = XmlText & { props: string | undefined };

export type AppliedXmlElement = XmlElement & {
  props: string | undefined;
  children: AppliedXmlNode[];
};

export type AppliedXmlNode = AppliedXmlText | AppliedXmlElement;

export function IsAppliedText(e: AppliedXmlNode): e is AppliedXmlText {
  return "text" in e;
}

export function IsAppliedElement(e: AppliedXmlNode): e is AppliedXmlElement {
  return "tag" in e;
}

function internal(
  tpe: XmlNode[],
  components: NodeJS.Dict<TpeFile>,
  context: ApplierContext
): AppliedXmlNode[] {
  return tpe.flatMap((n) => {
    if (IsText(n)) {
      return { ...n, text: n.text, props: (context.tree as any).id };
    }

    if (n.tag === "children") {
      return context.children;
    }

    const component = components[n.tag];
    if (component) {
      context.used.push(n.tag);
      return internal(component.xml_template, components, {
        ...context,
        children: internal(n.children, components, context),
        props: [...context.props, n.attributes],
        tree: context.tree.add(n.attributes),
      });
    }

    return {
      ...n,
      attributes: n.attributes,
      children: internal(n.children, components, context),
      props: (context.tree as any).id,
    };
  });
}

export function ApplyComponents(
  tpe: XmlNode[],
  components: NodeJS.Dict<TpeFile>
) {
  const tree = PropsTree();
  const context: ApplierContext = {
    children: [],
    props: [],
    used: [],
    tree: tree,
  };
  const result = internal(tpe, components, context);

  return {
    tpe: result,
    components: context.used.filter((item, i, ar) => ar.indexOf(item) === i),
    props: tree.json(),
  };
}
