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