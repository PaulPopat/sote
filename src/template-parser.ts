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
import { CreateElementsFromHTML } from "./utils/html";

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

function IsElement(node: ChildNode): node is Element {
  return node.nodeType === node.ELEMENT_NODE;
}

function IsComment(node: ChildNode): node is Comment {
  return node.nodeType === node.COMMENT_NODE;
}

function IsText(node: ChildNode): node is Text {
  return node.nodeType === node.TEXT_NODE;
}

export default function (components: { [key: string]: string }) {
  const ImplementTextReferences = (template: string, props: any) => {
    let result = template;
    for (const match of result.match(/{[^}]+}/gm) ?? []) {
      const key = match.replace("{", "").replace("}", "");
      const accessed = Evaluate(key, props);
      Assert(
        IsUnion(IsString, IsNumber),
        accessed,
        "Text references must be strings or numbers for (" + key + ")"
      );
      result = result.replace(match, escape(accessed.toString()));
    }

    return result;
  };

  const ProcessCollection = (elements: NodeListOf<ChildNode>, props: any) => {
    for (let i = 0; i < elements.length; i++) {
      const node = elements.item(i);
      if (!node) {
        continue;
      }

      if (IsComment(node)) {
        node.remove();
        continue;
      }

      if (IsText(node)) {
        node.textContent = node.textContent?.trim() ?? null;
        continue;
      }

      if (!IsElement(node)) {
        continue;
      }

      const tag = node.tagName.toLowerCase();
      const inputprops = GetPropsData(node.attributes, props);
      const component = components[tag];
      if (tag === "if") {
        const inputprops = GetPropsData(node.attributes, props);
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

        node.replaceWith(
          ...CreateElementsFromHTML(
            node.ownerDocument,
            BuildTemplate(node.innerHTML, { ...props }, "")
          )
        );
      } else if (tag === "for") {
        const inputprops = GetPropsData(node.attributes, props);
        Assert(
          IsObject({ subject: IsArray(DoNotCare), key: IsString }),
          inputprops,
          "For tags must use arrays as the arguments for (" +
            node.outerHTML +
            ")"
        );
        node.replaceWith(
          ...inputprops.subject
            .map((s) =>
              CreateElementsFromHTML(
                node.ownerDocument,
                BuildTemplate(
                  node.innerHTML,
                  { ...props, [inputprops.key]: s },
                  ""
                )
              )
            )
            .reduce((c, n) => [...c, ...n], [] as Element[])
        );
      } else if (!component) {
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

        ProcessCollection(node.childNodes, props);
      } else {
        node.replaceWith(
          ...CreateElementsFromHTML(
            node.ownerDocument,
            BuildTemplate(
              component,
              inputprops,
              BuildTemplate(node.innerHTML, props, "")
            )
          )
        );
      }
    }
  };

  const BuildTemplate = (template: string, props: any, children: string) => {
    const dom = new JSDOM(
      `<!DOCTYPE html><html><head></head><body id="body-content">${template}</body></html>`
    );
    const document = dom.window.document;
    const children_tag = document.querySelector("children");
    children_tag?.replaceWith(
      ...CreateElementsFromHTML(document, BuildTemplate(children, props, ""))
    );
    const body = document.getElementById("body-content");
    if (!body) {
      throw new Error();
    }

    ProcessCollection(body.childNodes, props);
    const result = body.innerHTML ?? "";
    return ImplementTextReferences(result, props);
  };

  return (template: string, props: any) => {
    const dom = new JSDOM(template);
    const document = dom.window.document;
    const body = document.body;
    if (!body) {
      throw new Error();
    }

    ProcessCollection(body.childNodes, props);
    return ImplementTextReferences(dom.serialize(), props);
  };
}
