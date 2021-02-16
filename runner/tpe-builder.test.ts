import { BuildTpe } from "./tpe-builder.ts";
import { ToXml, ParseXml } from "../compiler/xml-parser.ts";
import { ParseTpeFile } from "../compiler/tpe-file-parser.ts";
import { assertEquals } from "https://deno.land/std@0.86.0/testing/asserts.ts";

Deno.test("Applies an attribute prop", async () => {
  assertEquals(
    ToXml(
      await BuildTpe(
        [
          {
            tag: "div",
            attributes: { class: ":props.test" },
            children: [],
          },
        ],
        {},
        { test: "hello world" },
        {}
      )
    ),
    `<div class="hello world"></div>`
  );
});

Deno.test("Applies text props", async () => {
  assertEquals(
    ToXml(
      await BuildTpe(
        [
          {
            tag: "div",
            attributes: {},
            children: [{ text: "{props.test}" }],
          },
        ],
        {},
        { test: "hello world" },
        {}
      )
    ),
    `<div>hello world</div>`
  );
});

Deno.test("Applies strings with bracers in text expressions", async () => {
  assertEquals(
    ToXml(
      await BuildTpe(
        [
          {
            tag: "div",
            attributes: {},
            children: [{ text: "{`{props.test}`}" }],
          },
        ],
        {},
        {},
        {}
      )
    ),
    `<div>{props.test}</div>`
  );
});

Deno.test("Supplies context to text expressions", async () => {
  assertEquals(
    ToXml(
      await BuildTpe(
        [
          {
            tag: "div",
            attributes: {},
            children: [{ text: "{context.test}" }],
          },
        ],
        {},
        {},
        { test: "hello world" }
      )
    ),
    `<div>hello world</div>`
  );
});

Deno.test("Applies for loops", async () => {
  assertEquals(
    ToXml(
      await BuildTpe(
        [
          {
            tag: "for",
            attributes: { subject: ":props.test", key: "key" },
            children: [
              {
                tag: "div",
                attributes: {},
                children: [{ text: "{key}" }],
              },
            ],
          },
        ],
        {},
        { test: ["hello", "world"] },
        {}
      )
    ),
    `<div>hello</div><div>world</div>`
  );
});

Deno.test("Applies for loops with in model arrays", async () => {
  assertEquals(
    ToXml(
      await BuildTpe(
        [
          {
            tag: "for",
            attributes: { subject: ":['hello', 'world']", key: "key" },
            children: [
              {
                tag: "div",
                attributes: {},
                children: [{ text: "{key}" }],
              },
            ],
          },
        ],
        {},
        {},
        {}
      )
    ),
    `<div>hello</div><div>world</div>`
  );
});

Deno.test("Applies for loops with in model complex arrays", async () => {
  assertEquals(
    ToXml(
      await BuildTpe(
        [
          {
            tag: "for",
            attributes: {
              subject:
                ":[{ url: '/', title: 'Welcome' }, { url: '/setup', title: 'Setup' }]",
              key: "page",
            },
            children: [
              {
                tag: "a",
                attributes: {
                  href: ":page.url",
                  class: ":props.at === page.url ? 'active' : ''",
                },
                children: [{ text: "{page.title}" }],
              },
            ],
          },
        ],
        {},
        { at: "/" },
        {}
      )
    ),
    `<a href="/" class="active">Welcome</a><a href="/setup" class="">Setup</a>`
  );
});

Deno.test("Will not apply if statements", async () => {
  assertEquals(
    ToXml(
      await BuildTpe(
        [
          {
            tag: "if",
            attributes: { check: ":props.test" },
            children: [
              {
                tag: "div",
                attributes: {},
                children: [{ text: "Hello world" }],
              },
            ],
          },
        ],
        {},
        { test: false },
        {}
      )
    ),
    ``
  );
});

Deno.test("Will apply if statements", async () => {
  assertEquals(
    ToXml(
      await BuildTpe(
        [
          {
            tag: "if",
            attributes: { check: ":props.test" },
            children: [
              {
                tag: "div",
                attributes: {},
                children: [{ text: "Hello world" }],
              },
            ],
          },
        ],
        {},
        { test: true },
        {}
      )
    ),
    `<div>Hello world</div>`
  );
});

Deno.test("Applies a component", async () => {
  assertEquals(
    ToXml(
      await BuildTpe(
        ParseXml(`<test::component />`),
        {
          "test::component": await ParseTpeFile(
            `<template><div>Hello world</div></template>`,
            ""
          ),
        },
        { test: true },
        {}
      )
    ),
    `<div>Hello world</div>`
  );
});

Deno.test("Applies expression whitespace around a component", async () => {
  assertEquals(
    ToXml(
      await BuildTpe(
        ParseXml(`<div>{' '}<test::component />{' '}</div>`),
        {
          "test::component": await ParseTpeFile(
            `<template><div>Hello world</div></template>`,
            ""
          ),
        },
        { test: true },
        {}
      )
    ),
    `<div> <div>Hello world</div> </div>`
  );
});

Deno.test("Adds props to component", async () => {
  assertEquals(
    ToXml(
      await BuildTpe(
        ParseXml(`<test::component text="Hello world" />`),
        {
          "test::component": await ParseTpeFile(
            `<template><div>{props.text}</div></template>`,
            ""
          ),
        },
        { test: true },
        {}
      )
    ),
    `<div>Hello world</div>`
  );
});

Deno.test("Applies component children", async () => {
  assertEquals(
    ToXml(
      await BuildTpe(
        ParseXml(`<test::component>Hello world</test::component>`),
        {
          "test::component": await ParseTpeFile(
            `<template><div><children /></div></template>`,
            ""
          ),
        },
        { test: true },
        {}
      )
    ),
    `<div>Hello world</div>`
  );
});

Deno.test("Applies component children more than once", async () => {
  assertEquals(
    ToXml(
      await BuildTpe(
        ParseXml(`<test::component>Hello world</test::component>`),
        {
          "test::component": await ParseTpeFile(
            `<template><div><children /></div><div><children /></div></template>`,
            ""
          ),
        },
        { test: true },
        {}
      )
    ),
    `<div>Hello world</div><div>Hello world</div>`
  );
});

Deno.test("Executes server js", async () => {
  assertEquals(
    ToXml(
      await BuildTpe(
        ParseXml(`<test::component text="Hello world" />`),
        {
          "test::component": await ParseTpeFile(
            `
            <template><for subject=":props" key="text"><span>{text}</span></for></template>
            <script area="server">return props.text.split(" ")</script>
            `,
            ""
          ),
        },
        { test: true },
        {}
      )
    ),
    `<span>Hello</span><span>world</span>`
  );
});
