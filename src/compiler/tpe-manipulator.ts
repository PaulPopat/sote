import { XmlNode, IsText } from "./xml-parser";
import { IsValidTag } from "../utils/html";

export function ApplySpecifier(tpe: XmlNode[], specifier: string): XmlNode[] {
  return tpe.map((n) => {
    if (IsText(n)) {
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
