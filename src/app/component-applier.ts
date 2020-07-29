import { JSDOM } from "jsdom";
import { AllNodes, IsElement, IsText, GetExpressions } from "../utils/html";

function TransformStatement(statement: string, props: NodeJS.Dict<string>) {
  let result = statement;
  for (const key in props) {
    result = result.replace(
      new RegExp(`props.${key}`, "gm"),
      "(" + props[key] + ")"
    );
  }

  return result;
}

function ReduceAttributes(element: Element, props: NodeJS.Dict<string>) {
  const attributes = element.attributes;
  if (!attributes) {
    return {};
  }

  for (let i = 0; i < attributes.length; i++) {
    const a = attributes.item(i);
    if (!a) {
      continue;
    }

    if (!a.value.startsWith(":")) {
      continue;
    }

    a.value = TransformStatement(a.value, props);
  }
}

function ReduceText(node: Text, props: NodeJS.Dict<string>) {
  let text = node.textContent;

  if (!text) {
    return;
  }

  for (const expression of GetExpressions(text)) {
    text = text.replace(expression, TransformStatement(expression, props));
  }

  node.textContent = text;
}

export function Apply(component: string, props: NodeJS.Dict<string>) {
  const dom = new JSDOM(component);
  for (const node of AllNodes(dom.window.document.body)) {
    if (IsElement(node)) {
      ReduceAttributes(node, props);
    }

    if (IsText(node)) {
      ReduceText(node, props);
    }
  }

  return dom.window.document.body.innerHTML;
}
