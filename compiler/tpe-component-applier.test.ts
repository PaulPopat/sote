import { assertEquals } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { GetUsed } from "./tpe-component-applier.ts";

Deno.test("Applies a simple component", () => {
  assertEquals(
    GetUsed([{ tag: "test-component", attributes: {}, children: [] }], {
      "test-component": {
        xml_template: [{ tag: "div", attributes: {}, children: [] }],
        server_js: undefined,
        client_js: undefined,
        css: undefined,
        title: undefined,
        language: undefined,
      },
    }),
    ["test-component"]
  );
});

Deno.test("Applies a component in children", () => {
  assertEquals(
    GetUsed(
      [
        {
          tag: "span",
          attributes: {},
          children: [{ tag: "test-component", attributes: {}, children: [] }],
        },
      ],
      {
        "test-component": {
          xml_template: [{ tag: "div", attributes: {}, children: [] }],
          server_js: undefined,
          client_js: undefined,
          css: undefined,
          title: undefined,
          language: undefined,
        },
      }
    ),
    ["test-component"]
  );
});

Deno.test("Applies a component in children of components", () => {
  assertEquals(
    GetUsed(
      [
        {
          tag: "test-component",
          attributes: {},
          children: [{ tag: "span", attributes: {}, children: [] }],
        },
      ],
      {
        "test-component": {
          xml_template: [
            {
              tag: "div",
              attributes: {},
              children: [{ tag: "children", attributes: {}, children: [] }],
            },
          ],
          server_js: undefined,
          client_js: undefined,
          css: undefined,
          title: undefined,
          language: undefined,
        },
      }
    ),
    ["test-component"]
  );
});

Deno.test("Only includes used components once", () => {
  assertEquals(
    GetUsed(
      [
        {
          tag: "test-component",
          attributes: {},
          children: [{ tag: "test-component", attributes: {}, children: [] }],
        },
      ],
      {
        "test-component": {
          xml_template: [
            {
              tag: "div",
              attributes: {},
              children: [{ tag: "children", attributes: {}, children: [] }],
            },
          ],
          server_js: undefined,
          client_js: undefined,
          css: undefined,
          title: undefined,
          language: undefined,
        },
      }
    ),
    ["test-component"]
  );
});

Deno.test("Applies components within components", () => {
  assertEquals(
    GetUsed(
      [
        {
          tag: "test-component",
          attributes: { tester: ":props.test" },
          children: [],
        },
      ],
      {
        "test-component": {
          xml_template: [
            {
              tag: "div",
              attributes: { class: ":props.tester" },
              children: [
                {
                  tag: "second-test-component",
                  attributes: {
                    second_tester: ":props.tester",
                  },
                  children: [],
                },
              ],
            },
          ],
          server_js: undefined,
          client_js: undefined,
          css: undefined,
          title: undefined,
          language: undefined,
        },
        "second-test-component": {
          xml_template: [
            {
              tag: "div",
              attributes: { class: ":props.second_tester" },
              children: [],
            },
          ],
          server_js: undefined,
          client_js: undefined,
          css: undefined,
          title: undefined,
          language: undefined,
        },
      }
    ),
    ["test-component", "second-test-component"]
  );
});
