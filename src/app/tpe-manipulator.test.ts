import { AddCssSpecifier } from "./tpe-manipulator";

it("Adds specifier", () => {
  expect(AddCssSpecifier(`<div>Hello world</div>`, "test-specifier")).toBe(
    `<div data-specifier="test-specifier">Hello world</div>`
  );
});

it("excludes components", () => {
  expect(
    AddCssSpecifier(
      `<div>Hello <test-c>Test</test-c> world</div>`,
      "test-specifier"
    )
  ).toBe(
    `<div data-specifier="test-specifier">Hello <test-c>Test</test-c> world</div>`
  );
});

it("excludes for loops", () => {
  expect(
    AddCssSpecifier(
      `<div>Hello <for subject="test" key="other">Test</for> world</div>`,
      "test-specifier"
    )
  ).toBe(
    `<div data-specifier="test-specifier">Hello <for subject="test" key="other">Test</for> world</div>`
  );
});

it("excludes if statements", () => {
  expect(
    AddCssSpecifier(
      `<div>Hello <if check="test">Test</if> world</div>`,
      "test-specifier"
    )
  ).toBe(
    `<div data-specifier="test-specifier">Hello <if check="test">Test</if> world</div>`
  );
});
