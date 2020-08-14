import { XmlNode, IsText, XmlText, XmlElement } from "./xml-parser";
import { TpeFile } from "./tpe-file-parser";

type ApplierContext = {
  children: AppliedXmlNode[];
  props: NodeJS.Dict<string>[];
};

export type AppliedXmlText = XmlText & { props: NodeJS.Dict<string>[] };

export type AppliedXmlElement = XmlElement & {
  props: NodeJS.Dict<string>[];
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
  used: string[],
  context: ApplierContext
): AppliedXmlNode[] {
  return tpe.flatMap((n) => {
    if (IsText(n)) {
      return { ...n, text: n.text, props: context.props };
    }

    if (n.tag === "children") {
      return context.children;
    }

    const component = components[n.tag];
    if (component) {
      used.push(n.tag);
      return internal(component.xml_template, components, used, {
        children: internal(n.children, components, used, context),
        props: [...context.props, n.attributes],
      });
    }

    return {
      ...n,
      attributes: n.attributes,
      children: internal(n.children, components, used, context),
      props: context.props,
    };
  });
}

export function ApplyComponents(
  tpe: XmlNode[],
  components: NodeJS.Dict<TpeFile>
): { tpe: AppliedXmlNode[]; components: string[] } {
  const used = [] as string[];
  const result = internal(tpe, components, used, { children: [], props: [] });

  return {
    tpe: result,
    components: used.filter((item, i, ar) => ar.indexOf(item) === i),
  };
}
