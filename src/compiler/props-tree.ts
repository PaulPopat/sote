import { v4 as uuid } from "uuid";

export type TreeJson = {
  post_process: string | undefined;
  props: NodeJS.Dict<string>;
  children: TreeJson[];
  id: string;
};

type Tree = {
  add(props: NodeJS.Dict<string>, post_process: string | undefined): Tree;
  readonly id: string;
  json(): TreeJson;
};

function InternalPropsTree(
  props: NodeJS.Dict<string>,
  post_process: string | undefined
): Tree {
  const id = uuid();
  let children: Tree[] = [];
  return {
    add(props: NodeJS.Dict<string>, post_process: string | undefined) {
      const result = InternalPropsTree(props, post_process);
      children = [...children, result];
      return result;
    },
    id,
    json() {
      return {
        post_process: post_process,
        props: props,
        children: children.map((c) => c.json()),
        id: id,
      };
    },
  };
}

export function PropsTree() {
  let children: Tree[] = [];
  return {
    add(props: NodeJS.Dict<string>, post_process: string | undefined) {
      const result = InternalPropsTree(props, post_process);
      children = [...children, result];
      return result;
    },
    json() {
      return children.map((c) => c.json());
    },
  };
}
