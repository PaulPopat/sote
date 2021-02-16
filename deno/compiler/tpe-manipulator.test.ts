import { assertEquals } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { ApplySpecifier } from "./tpe-manipulator.ts";

Deno.test("Applies data attribute", () => {
  assertEquals(
    ApplySpecifier(
      [{ tag: "div", attributes: {}, children: [] }],
      "test-specifier"
    ),
    [
      {
        tag: "div",
        attributes: { "data-specifier": "test-specifier" },
        children: [],
      },
    ]
  );
});

Deno.test("Applies data attribute to children", () => {
  assertEquals(
    ApplySpecifier(
      [
        {
          tag: "div",
          attributes: {},
          children: [{ tag: "div", attributes: {}, children: [] }],
        },
      ],
      "test-specifier"
    ),
    [
      {
        tag: "div",
        attributes: { "data-specifier": "test-specifier" },
        children: [
          {
            tag: "div",
            attributes: { "data-specifier": "test-specifier" },
            children: [],
          },
        ],
      },
    ]
  );
});

Deno.test("Ignores none html tags", () => {
  assertEquals(
    ApplySpecifier(
      [{ tag: "test", attributes: {}, children: [] }],
      "test-specifier"
    ),
    [
      {
        tag: "test",
        attributes: {},
        children: [],
      },
    ]
  );
});

Deno.test("Applies data attribute to children of none html tags", () => {
  assertEquals(
    ApplySpecifier(
      [
        {
          tag: "test",
          attributes: {},
          children: [{ tag: "div", attributes: {}, children: [] }],
        },
      ],
      "test-specifier"
    ),
    [
      {
        tag: "test",
        attributes: {},
        children: [
          {
            tag: "div",
            attributes: { "data-specifier": "test-specifier" },
            children: [],
          },
        ],
      },
    ]
  );
});
