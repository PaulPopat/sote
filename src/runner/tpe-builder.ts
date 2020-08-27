import { XmlNode, IsText } from "../compiler/xml-parser";
import { GetExpressions } from "../utils/html";
import { EvaluateAsyncExpression, EvaluateAsync } from "../utils/evaluate";
import { TransformPropertiesAsync } from "../utils/object";
import { IsString } from "@paulpopat/safe-type";
import { PagesModel } from "../compiler/page-builder";

type Params = {
  name: string;
  value: any;
}[];

export async function ReduceText(node: string, props: any, params: Params) {
  if (!node) {
    return node;
  }

  let text = node;
  for (const expression of GetExpressions(text)) {
    text = text.replace(
      `{${expression}}`,
      await EvaluateAsyncExpression(expression, [
        { name: "props", value: props },
        ...params,
      ])
    );
  }

  return text;
}

async function Internal(
  page: XmlNode[],
  components: PagesModel["components"],
  props: any,
  params: Params,
  children: XmlNode[]
): Promise<XmlNode[]> {
  const result: XmlNode[] = [];
  for (const n of page) {
    if (IsText(n)) {
      result.push({
        text: await ReduceText(n.text, props, params),
      } as XmlNode);
      continue;
    }

    const attributes = await TransformPropertiesAsync(n.attributes, async (p) =>
      p.startsWith(":")
        ? await EvaluateAsyncExpression(p.replace(":", ""), [
            { name: "props", value: props },
            ...params,
          ])
        : p
    );

    if (n.tag === "for") {
      const subject = attributes.subject;
      const key = attributes.key;
      if (!Array.isArray(subject) || !IsString(key)) {
        throw new Error(
          `Trying to build a for loop without an array as the subject and a string as the key.
Subject: "${n.attributes.subject}"
Key: "${n.attributes.key}"`
        );
      }

      for (const s of subject) {
        const input = await Internal(
          n.children,
          components,
          props,
          [...params, { name: key, value: s }],
          children
        );
        result.push(...input);
      }

      continue;
    }

    if (n.tag === "if") {
      const check = attributes.check;
      if (check) {
        const input = await Internal(
          n.children,
          components,
          props,
          params,
          children
        );
        result.push(...input);
      }

      continue;
    }

    if (n.tag === "children") {
      result.push(...children);
      continue;
    }

    const component = components[n.tag];
    if (component) {
      const input_props = component.server_js?.get
        ? await EvaluateAsync(component.server_js?.get ?? "", [
            { name: "props", value: attributes },
            ...params,
          ])
        : attributes;
      const input = await Internal(
        component.xml_template,
        components,
        input_props,
        params,
        await Internal(n.children, components, props, params, children)
      );
      result.push(...input);
      continue;
    }

    result.push({
      ...n,
      attributes,
      children: await Internal(n.children, components, props, params, children),
    } as XmlNode);
  }

  return result;
}

export async function BuildTpe(
  page: PagesModel["pages"][number]["model"]["xml_template"],
  components: PagesModel["components"],
  props: any,
  context: any
): Promise<XmlNode[]> {
  return Internal(
    page,
    components,
    props,
    [{ name: "context", value: context }],
    []
  );
}
