import { BuildTpe } from "./tpe-builder";
import { ParseXml, ToXml } from "../compiler/xml-parser";
import { AppliedXmlElement } from "../compiler/tpe-component-applier";

it("Applies an attribute prop", () => {
  expect(
    ToXml(
      BuildTpe(
        [
          {
            tag: "div",
            attributes: { class: ":props.test" },
            children: [],
            props: [],
          },
        ],
        { test: "hello world" }
      )
    )
  ).toBe(`<div class="hello world"/>`);
});

it("Applies text props", () => {
  expect(
    ToXml(
      BuildTpe(
        [
          {
            tag: "div",
            attributes: {},
            children: [{ text: "{props.test}", props: [] }],
            props: [],
          } as AppliedXmlElement,
        ],
        { test: "hello world" }
      )
    )
  ).toBe(`<div>hello world</div>`);
});

it("Applies for loops", () => {
  expect(
    ToXml(
      BuildTpe(
        [
          {
            tag: "for",
            attributes: { subject: ":props.test", key: "key" },
            props: [],
            children: [
              {
                tag: "div",
                attributes: {},
                props: [],
                children: [{ text: "{props.key}", props: [] }],
              } as AppliedXmlElement,
            ],
          } as AppliedXmlElement,
        ],
        { test: ["hello", "world"] }
      )
    )
  ).toBe(`<div>hello</div><div>world</div>`);
});

it("Will not apply if statements", () => {
  expect(
    ToXml(
      BuildTpe(
        [
          {
            tag: "if",
            attributes: { check: ":props.test" },
            props: [],
            children: [
              {
                tag: "div",
                attributes: {},
                props: [],
                children: [{ text: "Hello world", props: [] }],
              } as AppliedXmlElement,
            ],
          },
        ],
        { test: false }
      )
    )
  ).toBe(``);
});

it("Will apply if statements", () => {
  expect(
    ToXml(
      BuildTpe(
        [
          {
            tag: "if",
            attributes: { check: ":props.test" },
            props: [],
            children: [
              {
                tag: "div",
                attributes: {},
                props: [],
                children: [{ text: "Hello world", props: [] }],
              } as AppliedXmlElement,
            ],
          },
        ],
        { test: true }
      )
    )
  ).toBe(`<div>Hello world</div>`);
});

it("Applies an multiple layered attribute prop", () => {
  expect(
    ToXml(
      BuildTpe(
        [
          {
            tag: "div",
            attributes: { class: ":props.super_test" },
            children: [],
            props: [
              { tester: ":props.test.split(' ')" },
              { super_test: ":props.tester.join(', ')" },
            ],
          },
        ],
        { test: "hello world" }
      )
    )
  ).toBe(`<div class="hello, world"/>`);
});
