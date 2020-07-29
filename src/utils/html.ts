export function IsElement(node: ChildNode): node is Element {
  return node.nodeType === node.ELEMENT_NODE;
}

export function IsComment(node: ChildNode): node is Comment {
  return node.nodeType === node.COMMENT_NODE;
}

export function IsText(node: ChildNode): node is Text {
  return node.nodeType === node.TEXT_NODE;
}

export function* GetExpressions(value: string) {
  let current = "";
  let depth = 0;
  for (const char of value) {
    if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        yield current;
        current = "";
      }
    }

    if (depth > 0) {
      current += char;
    }

    if (char === "{") {
      depth += 1;
    }
  }
}

export function* AllNodes(
  element: Element
): Generator<ChildNode, void, unknown> {
  const nodes = element.childNodes;
  for (let i = 0; i < nodes.length; i++) {
    const part = nodes.item(i);
    yield part;

    if (IsElement(part)) {
      yield* AllNodes(part);
    }
  }
}

export function CreateElementsFromHTML(document: Document, htmlString: string) {
  var div = document.createElement("div");
  div.innerHTML = htmlString;
  const result = div.childNodes;
  if (!result) {
    throw new Error("Invalid html node");
  }

  const final: ChildNode[] = [];
  for (let i = 0; i < result.length; i++) {
    const input = result.item(i);
    if (!input) {
      continue;
    }

    final.push(input);
  }

  return final;
}

export function ChildNodesToArray(nodes: NodeListOf<ChildNode>) {
  const result: ChildNode[] = [];
  for (let i = 0; i < nodes.length; i++) {
    result.push(nodes.item(i));
  }

  return result;
}
