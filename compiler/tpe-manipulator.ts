import { IsXmlText, XmlNode } from "../types/app.ts";
import { IsValidTag } from "../util/html.ts";

export function ApplySpecifier(tpe: XmlNode[], specifier: string): XmlNode[] {
  return tpe.map((n) => {
    if (IsXmlText(n)) {
      return n;
    }

    if (!IsValidTag(n.tag)) {
      return {
        ...n,
        children: ApplySpecifier(n.children, specifier),
      };
    }

    return {
      ...n,
      attributes: { ...n.attributes, "data-specifier": specifier },
      children: ApplySpecifier(n.children, specifier),
    };
  });
}
