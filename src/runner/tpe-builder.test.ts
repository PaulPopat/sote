import { BuildTpe } from "./tpe-builder";
import { ToXml } from "../compiler/xml-parser";
import { AppliedXmlElement } from "../compiler/tpe-component-applier";

it("Applies an attribute prop", async () => {
  expect(
    ToXml(
      await BuildTpe(
        [
          {
            tag: "div",
            attributes: { class: ":props.test" },
            children: [],
            props: undefined,
          },
        ],
        [],
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
          } as AppliedXmlElement,
        ],
        [],
        { test: "hello world" },
        {}
      )
    )
  ).toBe(`<div>hello world</div>`);
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
          } as AppliedXmlElement,
        ],
        [],
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
            props: undefined,
            children: [
              {
                tag: "div",
                attributes: {},
                props: undefined,
                children: [{ text: "{key}", props: undefined }],
              } as AppliedXmlElement,
            ],
          } as AppliedXmlElement,
        ],
        [],
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
            props: undefined,
            children: [
              {
                tag: "div",
                attributes: {},
                props: undefined,
                children: [{ text: "{key}", props: undefined }],
              } as AppliedXmlElement,
            ],
          } as AppliedXmlElement,
        ],
        [],
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
            props: undefined,
            children: [
              {
                tag: "a",
                attributes: {
                  href: ":page.url",
                  class: ":props.at === page.url ? 'active' : ''",
                },
                props: "1",
                children: [{ text: "{page.title}", props: "1" }],
              } as AppliedXmlElement,
            ],
          } as AppliedXmlElement,
        ],
        [
          {
            id: "1",
            children: [],
            props: { at: "/" },
            post_process: undefined,
          },
        ],
        {},
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
            props: undefined,
            children: [
              {
                tag: "div",
                attributes: {},
                props: undefined,
                children: [{ text: "Hello world", props: undefined }],
              } as AppliedXmlElement,
            ],
          },
        ],
        [],
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
            props: undefined,
            children: [
              {
                tag: "div",
                attributes: {},
                props: undefined,
                children: [{ text: "Hello world", props: undefined }],
              } as AppliedXmlElement,
            ],
          },
        ],
        [],
        { test: true },
        {}
      )
    )
  ).toBe(`<div>Hello world</div>`);
});

it("Applies an multiple layered attribute prop", async () => {
  expect(
    ToXml(
      await BuildTpe(
        [
          {
            tag: "div",
            attributes: { class: ":props.super_test" },
            children: [],
            props: "2",
          },
        ],
        [
          {
            id: "1",
            props: { tester: ":props.test.split(' ')" },
            children: [
              {
                id: "2",
                props: { super_test: ":props.tester.join(', ')" },
                children: [],
                post_process: undefined,
              },
            ],
            post_process: undefined,
          },
        ],
        { test: "hello world" },
        {}
      )
    )
  ).toBe(`<div class="hello, world"></div>`);
});
