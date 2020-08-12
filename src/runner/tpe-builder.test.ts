import { BuildTpe } from "./tpe-builder";
import { ParseXml, ToXml } from "../compiler/xml-parser";

it("Applies an attribute prop", () => {
  expect(
    ToXml(
      BuildTpe(ParseXml(`<div class=":props.test" />`), { test: "hello world" })
    )
  ).toBe(`<div class="hello world"/>`);
});

it("Applies text props", () => {
  expect(
    ToXml(
      BuildTpe(ParseXml(`<div>{props.test}</div>`), { test: "hello world" })
    )
  ).toBe(`<div>hello world</div>`);
});

it("Applies for loops", () => {
  expect(
    ToXml(
      BuildTpe(
        ParseXml(
          `<for subject=":props.test" key="key"><div>{props.key}</div></for>`
        ),
        { test: ["hello", "world"] }
      )
    )
  ).toBe(`<div>hello</div><div>world</div>`);
});

it("Will not apply if statements", () => {
  expect(
    ToXml(
      BuildTpe(
        ParseXml(`<if check=":props.test"><div>Hello world</div></if>`),
        { test: false }
      )
    )
  ).toBe(``);
});

it("Will apply if statements", () => {
  expect(
    ToXml(
      BuildTpe(
        ParseXml(`<if check=":props.test"><div>Hello world</div></if>`),
        { test: true }
      )
    )
  ).toBe(`<div>Hello world</div>`);
});
