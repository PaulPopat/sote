export function CreateElementsFromHTML(document: Document, htmlString: string) {
  var div = document.createElement("div");
  div.innerHTML = htmlString.trim();
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
