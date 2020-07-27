import { AddCssSpecifier } from "./tpe-manipulator";

it("Adds specifier", () => {
  expect(AddCssSpecifier(`<div>Hello world</div>`, [], "test-specifier")).toBe(
    `<div data-specifier="test-specifier">Hello world</div>`
  );
});

it("excludes components", () => {
  expect(
    AddCssSpecifier(
      `<div>Hello <test-c>Test</test-c> world</div>`,
      ["test-c"],
      "test-specifier"
    )
  ).toBe(
    `<div data-specifier="test-specifier">Hello <test-c>Test</test-c> world</div>`
  );
});
