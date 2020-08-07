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
