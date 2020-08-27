import { XmlNode, IsText, XmlText, XmlElement } from "./xml-parser";
import { TpeFile } from "./tpe-file-parser";

function* internal(
  tpe: XmlNode[],
  components: NodeJS.Dict<TpeFile>
): Generator<string, void, unknown> {
  for (const n of tpe) {
    if (IsText(n)) {
      continue;
    }

    const component = components[n.tag];
    if (component) {
      yield n.tag;
      yield* internal(component.xml_template, components);
    }

    if (n.children) {
      yield* internal(n.children, components);
    }
  }
}

export function GetUsed(tpe: XmlNode[], components: NodeJS.Dict<TpeFile>) {
  return [...internal(tpe, components)].filter(
    (item, i, ar) => ar.indexOf(item) === i
  );
}
