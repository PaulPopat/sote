import { XmlNode, IsText } from "../compiler/xml-parser";
import { GetExpressions } from "../utils/html";
import { EvaluateAsyncExpression } from "../utils/evaluate";
import { TransformPropertiesAsync } from "../utils/object";
import { IsString } from "@paulpopat/safe-type";
import { AppliedXmlNode } from "../compiler/tpe-component-applier";
import { TreeJson } from "../compiler/props-tree";
import { BuildTree } from "./props-tree-runner";

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
  tpe: AppliedXmlNode[],
  tree: { get(id: string): NodeJS.Dict<any> },
  props: any,
  params: Params
): Promise<XmlNode[]> {
  const result: XmlNode[] = [];
  for (const n of tpe) {
    const inner_props = n.props ? tree.get(n.props) : props;
    if (IsText(n)) {
      result.push({ text: await ReduceText(n.text, inner_props, params) } as XmlNode);
      continue;
    }

    const attributes = await TransformPropertiesAsync(n.attributes, async (p) =>
      p.startsWith(":")
        ? await EvaluateAsyncExpression(p.replace(":", ""), [
            { name: "props", value: inner_props },
            ...params,
          ])
        : p
    );

    if (n.tag === "for") {
      const subject = attributes.subject;
      const key = attributes.key;
      if (!Array.isArray(subject) || !IsString(key)) {
        throw new Error(
          "Trying to build a for loop without an array as the subject and a string as the key"
        );
      }

      for (const s of subject) {
        result.push(
          ...(await Internal(n.children, tree, props, [
            ...params,
            { name: key, value: s },
          ]))
        );
      }

      continue;
    }

    if (n.tag === "if") {
      const check = attributes.check;
      if (check) {
        result.push(...(await Internal(n.children, tree, props, params)));
      }

      continue;
    }

    result.push({
      ...n,
      attributes,
      children: await Internal(n.children, tree, props, params),
    } as XmlNode);
  }

  return result;
}

export async function BuildTpe(
  tpe: AppliedXmlNode[],
  tree: TreeJson[],
  props: any,
  context: any
): Promise<XmlNode[]> {
  const built = await BuildTree(tree, props, context);
  return Internal(tpe, built, props, [{ name: "context", value: context }]);
}
