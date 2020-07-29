import { Apply } from "./component-applier";

it("Applies basic props to attributes", () => {
  expect(
    Apply(`<div class=":props.test"></div>`, { test: "props.other" })
  ).toBe(`<div class=":(props.other)"></div>`);
});

it("Applies basic props to text statements", () => {
  expect(
    Apply(`<div>{props.test}</div>`, { test: "props.other" })
  ).toBe(`<div>{(props.other)}</div>`);
});

it("Applies props as part of an expression", () => {
  expect(
    Apply(`<div class=":props.test + 'test'"></div>`, { test: "props.other" })
  ).toBe(`<div class=":(props.other) + 'test'"></div>`);
});

it("Transforms deep expressions", () => {
  expect(
    Apply(`<div class=":props.test.something"></div>`, { test: "props.other" })
  ).toBe(`<div class=":(props.other).something"></div>`);
});
