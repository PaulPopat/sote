import { v4 as uuid } from "uuid";

export type TreeJson = {
  props: NodeJS.Dict<string>;
  children: TreeJson[];
  id: string;
};

type Tree = {
  add(props: NodeJS.Dict<string>): Tree;
  readonly id: string;
  json(): TreeJson;
};

function InternalPropsTree(props?: NodeJS.Dict<string>): Tree {
  const id = uuid();
  let children: Tree[] = [];
  return {
    add(props: NodeJS.Dict<string>) {
      const result = InternalPropsTree(props);
      children = [...children, result];
      return result;
    },
    id,
    json() {
      return {
        props: props ?? {},
        children: children.map((c) => c.json()),
        id: id,
      };
    },
  };
}

export function PropsTree() {
  let children: Tree[] = [];
  return {
    add(props: NodeJS.Dict<string>) {
      const result = InternalPropsTree(props);
      children = [...children, result];
      return result;
    },
    json() {
      return children.map((c) => c.json());
    },
  };
}
