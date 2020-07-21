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
import { Evalulate } from "./utils/evaluate";

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
      result[c.name] = Evalulate(c.value.slice(1), props);
    } else {
      result[c.name] = c.value;
    }
  }

  return result;
}

function CreateElementsFromHTML(document: Document, htmlString: string) {
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

export default function (components: { [key: string]: string }) {
  const ImplementTextReferences = (template: string, props: any) => {
    let result = template;
    for (const match of result.match(/{.+}/) ?? []) {
      const key = match.replace("{", "").replace("}", "");
      const accessed = Evalulate(key, props);
      Assert(
        IsUnion(IsString, IsNumber),
        accessed,
        "Text references must be strings or numbers"
      );
      result = result.replace(match, escape(accessed.toString()));
    }

    return result;
  };

  const ProcessCollection = (elements: HTMLCollection, props: any) => {
    for (let i = 0; i < elements.length; i++) {
      const element = elements.item(i);
      if (!element) {
        continue;
      }

      const tag = element.tagName.toLowerCase();
      const inputprops = GetPropsData(element.attributes, props);
      const component = components[tag];
      if (tag === "if") {
        const inputprops = GetPropsData(element.attributes, props);
        Assert(
          IsObject({ check: IsBoolean }),
          inputprops,
          "If tags must use booleans as the arguments"
        );
        if (!inputprops.check) {
          element.remove();
          continue;
        }

        element.replaceWith(
          ...CreateElementsFromHTML(
            element.ownerDocument,
            BuildTemplate(element.innerHTML, { ...props }, "")
          )
        );
      } else if (tag === "for") {
        const inputprops = GetPropsData(element.attributes, props);
        Assert(
          IsObject({ subject: IsArray(DoNotCare), key: IsString }),
          inputprops,
          "For tags must use arrays as the arguments"
        );
        element.replaceWith(
          ...inputprops.subject
            .map((s) =>
              CreateElementsFromHTML(
                element.ownerDocument,
                BuildTemplate(
                  element.innerHTML,
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
            "Props for a html element must be a string or a number"
          );
        }

        for (const key in inputprops) {
          element.setAttribute(key, escape(inputprops[key].toString()));
        }

        ProcessCollection(element.children, props);
      } else {
        element.replaceWith(
          ...CreateElementsFromHTML(
            element.ownerDocument,
            BuildTemplate(
              component,
              inputprops,
              BuildTemplate(element.innerHTML, props, "")
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
    document
      .querySelector("CHILDREN")
      ?.replaceWith(
        ...CreateElementsFromHTML(document, BuildTemplate(children, props, ""))
      );
    const body = document.getElementById("body-content");
    if (!body) {
      throw new Error();
    }

    ProcessCollection(body.children, props);
    const result = body.innerHTML ?? "";
    return ImplementTextReferences(result, props);
  };

  return (layout: string, template: string, props: any) => {
    const dom = new JSDOM(layout);
    dom.window.document
      .querySelector("BODY_CONTENT")
      ?.replaceWith(
        ...CreateElementsFromHTML(
          dom.window.document,
          BuildTemplate(template, props, "")
        )
      );
    return dom.serialize();
  };
}
