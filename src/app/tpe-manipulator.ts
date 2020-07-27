import { JSDOM } from "jsdom";

function isValidTag(tag: string) {
  const t = tag.toLowerCase();
  return (
    [
      "a",
      "abbr",
      "acronym",
      "address",
      "applet",
      "area",
      "article",
      "aside",
      "audio",
      "b",
      "base",
      "basefont",
      "bdi",
      "bdo",
      "bgsound",
      "big",
      "blink",
      "blockquote",
      "body",
      "br",
      "button",
      "canvas",
      "caption",
      "center",
      "cite",
      "code",
      "col",
      "colgroup",
      "content",
      "data",
      "datalist",
      "dd",
      "decorator",
      "del",
      "details",
      "dfn",
      "dir",
      "div",
      "dl",
      "dt",
      "element",
      "em",
      "embed",
      "fieldset",
      "figcaption",
      "figure",
      "font",
      "footer",
      "form",
      "frame",
      "frameset",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "head",
      "header",
      "hgroup",
      "hr",
      "html",
      "i",
      "iframe",
      "img",
      "input",
      "ins",
      "isindex",
      "kbd",
      "keygen",
      "label",
      "legend",
      "li",
      "link",
      "listing",
      "main",
      "map",
      "mark",
      "marquee",
      "menu",
      "menuitem",
      "meta",
      "meter",
      "nav",
      "nobr",
      "noframes",
      "noscript",
      "object",
      "ol",
      "optgroup",
      "option",
      "output",
      "p",
      "param",
      "plaintext",
      "pre",
      "progress",
      "q",
      "rp",
      "rt",
      "ruby",
      "s",
      "samp",
      "script",
      "section",
      "select",
      "shadow",
      "small",
      "source",
      "spacer",
      "span",
      "strike",
      "strong",
      "style",
      "sub",
      "summary",
      "sup",
      "table",
      "tbody",
      "td",
      "template",
      "textarea",
      "tfoot",
      "th",
      "thead",
      "time",
      "title",
      "tr",
      "track",
      "tt",
      "u",
      "ul",
      "var",
      "video",
      "wbr",
      "xmp",
    ].find((e) => e === t) != null
  );
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

export function AddCssSpecifier(tpe: string, specifier: string) {
  const dom = new JSDOM(tpe);
  for (const element of GetAllElements(dom.window.document.body.children)) {
    if (!isValidTag(element.tagName)) {
      continue;
    }

    element.setAttribute("data-specifier", specifier);
  }

  return dom.window.document.body.innerHTML;
}
