import { JSDOM } from "jsdom";
import {
  CreateElementsFromHTML,
  IsElement,
  ChildNodesToArray,
  IsValidTag,
} from "../utils/html";
import { Apply } from "./component-applier";

function GetPropsStrings(element: Element) {
  const result: NodeJS.Dict<string> = {};
  const attributes = element.attributes;
  if (!attributes) {
    return result;
  }

  for (let i = 0; i < attributes.length; i++) {
    const attribute = attributes.item(i);
    if (!attribute) {
      continue;
    }

    if (attribute.value.startsWith(":")) {
      result[attribute.name] = attribute.value.replace(":", "");
    } else {
      result[attribute.name] = `'${attribute.value}'`;
    }
  }

  return result;
}

function AddChildren(component: string, children: NodeListOf<ChildNode>) {
  const dom = new JSDOM(component);
  dom.window.document
    .querySelector("children")
    ?.replaceWith(...ChildNodesToArray(children));

  return dom.window.document.body.childNodes;
}

function Pass(
  nodes: ChildNode[],
  components: NodeJS.Dict<string>,
  components_used: string[]
) {
  for (const node of nodes) {
    if (!IsElement(node)) {
      continue;
    }

    const tag = node.tagName.toLowerCase();
    const component = components[tag];
    if (!component) {
      Pass(ChildNodesToArray(node.childNodes), components, components_used);
      continue;
    }

    components_used.push(tag);
    const input = ChildNodesToArray(
      AddChildren(Apply(component, GetPropsStrings(node)), node.childNodes)
    );
    node.replaceWith(...input);
    Pass(input, components, components_used);
  }
}

export function CompileTpe(
  layout: string,
  tpe: string,
  components: NodeJS.Dict<string>
) {
  const components_used = [] as string[];
  const dom = new JSDOM(layout);
  dom.window.document
    .querySelector("BODY_CONTENT")
    ?.replaceWith(...CreateElementsFromHTML(dom.window.document, tpe));

  Pass(
    ChildNodesToArray(dom.window.document.body.childNodes),
    components,
    components_used
  );

  return { template: dom.serialize(), components: components_used };
}
