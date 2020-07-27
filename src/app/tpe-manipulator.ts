import { JSDOM } from "jsdom";

function isValidTag(tag: string, document: Document) {
  const result = document.createElement(tag.toUpperCase()).toString();
  return result != "[object HTMLElement]";
}

function* GetAllElements(
  collection: HTMLCollection
): Generator<Element, void, unknown> {
  for (let i = 0; i < collection.length; i++) {
    const e = collection.item(i);
    if (!e) {
      continue;
    }

    yield e;
    yield* GetAllElements(e.children);
  }
}

export function AddCssSpecifier(
  tpe: string,
  specifier: string
) {
  const dom = new JSDOM(tpe);
  for (const element of GetAllElements(dom.window.document.body.children)) {
    if (!isValidTag(element.tagName, dom.window.document)) {
      continue;
    }

    element.setAttribute("data-specifier", specifier);
  }

  return dom.window.document.body.innerHTML;
}
