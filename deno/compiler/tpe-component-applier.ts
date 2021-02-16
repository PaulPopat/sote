import { IsXmlText, TpeFile, XmlNode } from "../types/app.ts";

function* internal(
  tpe: XmlNode[],
  components: Record<string, TpeFile>
): Generator<string, void, unknown> {
  for (const n of tpe) {
    if (IsXmlText(n)) {
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

export function GetUsed(tpe: XmlNode[], components: Record<string, TpeFile>) {
  return [...internal(tpe, components)].filter(
    (item, i, ar) => ar.indexOf(item) === i
  );
}
