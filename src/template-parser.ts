import { JSDOM } from "jsdom";
import { Assert } from "./utils/types";
import {
  IsDictionary,
  IsUnion,
  IsString,
  IsNumber,
  Optional,
  IsObject,
  DoNotCare,
  IsArray,
  IsBoolean,
} from "@paulpopat/safe-type";
import escape from "escape-html";
import { Evaluate } from "./utils/evaluate";
import {
  CreateElementsFromHTML,
  ChildNodesToArray,
  IsComment,
  IsText,
  IsElement,
  GetExpressions,
} from "./utils/html";

const IsValidHtmlProps = IsDictionary(IsUnion(IsString, IsNumber));

function GetPropsData(attributes: NamedNodeMap | undefined, props: any): any {
  if (!attributes) {
    return {};
  }

  const result: any = {};
  for (let a = 0; a < attributes.length; a++) {
    const c = attributes.item(a);
    if (!c) {
      continue;
    }

    if (c.value.startsWith(":")) {
      result[c.name] = Evaluate(c.value.slice(1), props);
    } else {
      result[c.name] = c.value;
    }
  }

  return result;
}

const ImplementTextReferences = (template: string | null, props: any) => {
  if (!template) {
    return template;
  }

  let result = template.replace(/\s\s+/g, " ").trim();
  for (const match of GetExpressions(result)) {
    const accessed = Evaluate(match, props);
    Assert(
      IsUnion(IsString, IsNumber),
      accessed,
      "Text references must be strings or numbers for (" + match + ")"
    );
    result = result.replace("{" + match + "}", accessed.toString());
  }

  return result;
};

const ProcessCollection = (
  elements: NodeListOf<ChildNode>,
  parent: Element,
  props: any
) => {
  let onFinish: (() => void)[] = [];
  for (let i = 0; i < elements.length; i++) {
    const node = elements.item(i);
    if (!node || node.parentElement !== parent) {
      continue;
    }

    if (IsComment(node)) {
      continue;
    }

    if (IsText(node)) {
      node.textContent = ImplementTextReferences(node.textContent, props);
      continue;
    }

    if (!IsElement(node)) {
      continue;
    }

    const tag = node.tagName.toLowerCase();
    const inputprops = GetPropsData(node.attributes, props);
    if (tag === "if") {
      Assert(
        IsObject({ check: IsBoolean }),
        inputprops,
        "If tags must use booleans as the arguments for (" +
          node.outerHTML +
          ")"
      );
      if (!inputprops.check) {
        node.remove();
        continue;
      }

      ProcessCollection(node.childNodes, node, props);
      node.replaceWith(
        ...CreateElementsFromHTML(node.ownerDocument, node.innerHTML)
      );
    } else if (tag === "for") {
      Assert(
        IsObject({ subject: IsArray(DoNotCare), key: IsString }),
        inputprops,
        "For tags must use arrays as the arguments for (" + node.outerHTML + ")"
      );

      const inner = "<div>" + node.innerHTML + "</div>";
      const input = inputprops.subject
        .map((s) => {
          const result = CreateElementsFromHTML(node.ownerDocument, inner)[0];
          Assert(IsElement, result);
          ProcessCollection(result.childNodes, result, {
            ...props,
            [inputprops.key]: s,
          });
          return ChildNodesToArray(result.childNodes);
        })
        .reduce((c, n) => [...c, ...n], [] as Element[]);
      onFinish = [...onFinish, () => node.replaceWith(...input)];
    } else {
      if (Object.keys(inputprops).length > 0) {
        Assert(
          Optional(IsValidHtmlProps),
          inputprops,
          "Props for a html element must be a string or a number for (" +
            node.outerHTML +
            ")"
        );
      }

      for (const key in inputprops) {
        node.setAttribute(key, escape(inputprops[key].toString()));
      }

      ProcessCollection(node.childNodes, node, props);
    }
  }

  for (const action of onFinish) {
    action();
  }
};

export default (template: string, props: any) => {
  const dom = new JSDOM(template);
  const document = dom.window.document;
  const body = document.body;
  if (!body) {
    throw new Error();
  }

  ProcessCollection(body.childNodes, body, props);
  return dom.serialize();
};
