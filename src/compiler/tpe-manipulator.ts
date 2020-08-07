import { XmlNode, IsText } from "./xml-parser";

export function IsValidTag(tag: string) { 
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

export function ApplySpecifier(tpe: XmlNode[], specifier: string): XmlNode[] {
  return tpe.map((n) => {
    if (IsText(n)) {
      return n;
    }

    if (!IsValidTag(n.tag)) {
      return {
        ...n,
        children: ApplySpecifier(n.children, specifier)
      }
    }

    return {
      ...n,
      attributes: { ...n.attributes, "data-specifier": specifier },
      children: ApplySpecifier(n.children, specifier),
    };
  });
}