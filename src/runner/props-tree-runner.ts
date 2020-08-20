import { TreeJson } from "../compiler/props-tree";
import { TransformPropertiesAsync } from "../utils/object";
import { EvaluateAsyncExpression } from "../utils/evaluate";

type ResolvedTree = {
  props: NodeJS.Dict<any>;
  id: string;
  children: ResolvedTree[];
};

async function BuildMemoryTree(
  tree: TreeJson,
  props: any,
  context: any
): Promise<ResolvedTree> {
  const p = await TransformPropertiesAsync(tree.props, async (e) =>
    e.startsWith(":")
      ? await EvaluateAsyncExpression(e.replace(":", ""), [
          { name: "props", value: props },
          { name: "context", value: context },
        ])
      : e
  );
  return {
    props: p,
    id: tree.id,
    children: await Promise.all(
      tree.children.map((c) => BuildMemoryTree(c, p, context))
    ),
  };
}

function Get(tree: ResolvedTree, id: string): NodeJS.Dict<any> | undefined {
  if (tree.id === id) {
    return tree.props;
  }

  return tree.children.map((b) => Get(b, id)).find((b) => b);
}

export async function BuildTree(tree: TreeJson[], props: any, context: any) {
  const built = await Promise.all(
    tree.map((t) => BuildMemoryTree(t, props, context))
  );
  return {
    get(id: string): NodeJS.Dict<any> {
      const result = built.map((b) => Get(b, id)).find((b) => b);
      if (!result) {
        throw new Error(
          "Cannot find props for component. This is likely a bug with SOTE. Please report this with as much detail as you can."
        );
      }

      return result;
    },
  };
}
