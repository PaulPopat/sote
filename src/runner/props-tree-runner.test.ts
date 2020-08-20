import { BuildTree } from "./props-tree-runner";

it("Gets simple props", async () => {
  expect(
    (
      await BuildTree(
        [
          {
            props: { test: "test" },
            children: [],
            id: "test",
            post_process: undefined,
          },
        ],
        {},
        {}
      )
    ).get("test")
  ).toStrictEqual({ test: "test" });
});

it("Resolves with page props", async () => {
  expect(
    (
      await BuildTree(
        [
          {
            props: { test: ":props.name" },
            children: [],
            id: "test",
            post_process: undefined,
          },
        ],
        { name: "test" },
        {}
      )
    ).get("test")
  ).toStrictEqual({ test: "test" });
});

it("Utilises context", async () => {
  expect(
    (
      await BuildTree(
        [
          {
            props: { test: ":context.name" },
            children: [],
            id: "test",
            post_process: undefined,
          },
        ],
        {},
        { name: "test" }
      )
    ).get("test")
  ).toStrictEqual({ test: "test" });
});

it("Resolves asynchronous expressions", async () => {
  expect(
    (
      await BuildTree(
        [
          {
            props: { test: ":await context.name()" },
            children: [],
            id: "test",
            post_process: undefined,
          },
        ],
        {},
        { name: async () => "test" }
      )
    ).get("test")
  ).toStrictEqual({ test: "test" });
});

it("Gets props from children", async () => {
  expect(
    (
      await BuildTree(
        [
          {
            props: { test: "test" },
            children: [
              {
                props: { deep: "deeper-test" },
                children: [],
                id: "test-2",
                post_process: undefined,
              },
            ],
            id: "test",
            post_process: undefined,
          },
        ],
        {},
        {}
      )
    ).get("test-2")
  ).toStrictEqual({ deep: "deeper-test" });
});

it("Resolves from parent props", async () => {
  expect(
    (
      await BuildTree(
        [
          {
            props: { test: "test" },
            children: [
              {
                props: { deep: ":props.test" },
                children: [],
                id: "test-2",
                post_process: undefined,
              },
            ],
            id: "test",
            post_process: undefined,
          },
        ],
        {},
        {}
      )
    ).get("test-2")
  ).toStrictEqual({ deep: "test" });
});

it("Resolves expressions", async () => {
  expect(
    (
      await BuildTree(
        [
          {
            props: { test: ":1.5" },
            children: [
              {
                props: { deep: ":Math.floor(props.test)" },
                children: [],
                id: "test-2",
                post_process: undefined,
              },
            ],
            id: "test",
            post_process: undefined,
          },
        ],
        {},
        {}
      )
    ).get("test-2")
  ).toStrictEqual({ deep: 1 });
});

it("Resolves post process JS", async () => {
  expect(
    (
      await BuildTree(
        [
          {
            props: { test: ":['hello', 'world']" },
            children: [
              {
                props: { deep: ":props.test" },
                children: [],
                id: "test-2",
                post_process: "return props.deep.join(' ')",
              },
            ],
            id: "test",
            post_process: undefined,
          },
        ],
        {},
        {}
      )
    ).get("test-2")
  ).toStrictEqual("hello world");
});

it("Resolves context in expressions", async () => {
  expect(
    (
      await BuildTree(
        [
          {
            props: { test: ":context.test" },
            children: [
              {
                props: { deep: ":props.test" },
                children: [],
                id: "test-2",
                post_process: undefined,
              },
            ],
            id: "test",
            post_process: undefined,
          },
        ],
        {},
        { test: "hello world" }
      )
    ).get("test-2")
  ).toStrictEqual({ deep: "hello world" });
});
