import { BuildTpe } from "./tpe-builder";
import { ToXml, ParseXml } from "../compiler/xml-parser";
import { ParseTpeFile } from "../compiler/tpe-file-parser";

it("Applies an attribute prop", async () => {
  expect(
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
    )
  ).toBe(`<div class="hello world"></div>`);
});

it("Applies text props", async () => {
  expect(
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
    )
  ).toBe(`<div>hello world</div>`);
});

it("Applies strings with bracers in text expressions", async () => {
  expect(
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
    )
  ).toBe(`<div>{props.test}</div>`);
});

it("Supplies context to text expressions", async () => {
  expect(
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
    )
  ).toBe(`<div>hello world</div>`);
});

it("Applies for loops", async () => {
  expect(
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
    )
  ).toBe(`<div>hello</div><div>world</div>`);
});

it("Applies for loops with in model arrays", async () => {
  expect(
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
    )
  ).toBe(`<div>hello</div><div>world</div>`);
});

it("Applies for loops with in model complex arrays", async () => {
  expect(
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
    )
  ).toBe(
    `<a href="/" class="active">Welcome</a><a href="/setup" class="">Setup</a>`
  );
});

it("Will not apply if statements", async () => {
  expect(
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
    )
  ).toBe(``);
});

it("Will apply if statements", async () => {
  expect(
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
    )
  ).toBe(`<div>Hello world</div>`);
});

it("Applies a component", async () => {
  expect(
    ToXml(
      await BuildTpe(
        ParseXml(`<test::component />`),
        {
          "test::component": ParseTpeFile(
            `<template><div>Hello world</div></template>`,
            ""
          ),
        },
        { test: true },
        {}
      )
    )
  ).toBe(`<div>Hello world</div>`);
});

it("Applies expression whitespace around a component", async () => {
  expect(
    ToXml(
      await BuildTpe(
        ParseXml(`<div>{' '}<test::component />{' '}</div>`),
        {
          "test::component": ParseTpeFile(
            `<template><div>Hello world</div></template>`,
            ""
          ),
        },
        { test: true },
        {}
      )
    )
  ).toBe(`<div> <div>Hello world</div> </div>`);
});

it("Adds props to component", async () => {
  expect(
    ToXml(
      await BuildTpe(
        ParseXml(`<test::component text="Hello world" />`),
        {
          "test::component": ParseTpeFile(
            `<template><div>{props.text}</div></template>`,
            ""
          ),
        },
        { test: true },
        {}
      )
    )
  ).toBe(`<div>Hello world</div>`);
});

it("Applies component children", async () => {
  expect(
    ToXml(
      await BuildTpe(
        ParseXml(`<test::component>Hello world</test::component>`),
        {
          "test::component": ParseTpeFile(
            `<template><div><children /></div></template>`,
            ""
          ),
        },
        { test: true },
        {}
      )
    )
  ).toBe(`<div>Hello world</div>`);
});

it("Applies component children more than once", async () => {
  expect(
    ToXml(
      await BuildTpe(
        ParseXml(`<test::component>Hello world</test::component>`),
        {
          "test::component": ParseTpeFile(
            `<template><div><children /></div><div><children /></div></template>`,
            ""
          ),
        },
        { test: true },
        {}
      )
    )
  ).toBe(`<div>Hello world</div><div>Hello world</div>`);
});

it("Executes server js", async () => {
  expect(
    ToXml(
      await BuildTpe(
        ParseXml(`<test::component text="Hello world" />`),
        {
          "test::component": ParseTpeFile(
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
    )
  ).toBe(`<span>Hello</span><span>world</span>`);
});
