import { ApplySpecifier } from "./tpe-manipulator";

describe("ApplySpecifier", () => {
  it("Applies data attribute", () => {
    expect(
      ApplySpecifier(
        [{ tag: "div", attributes: {}, children: [] }],
        "test-specifier"
      )
    ).toEqual([
      {
        tag: "div",
        attributes: { "data-specifier": "test-specifier" },
        children: [],
      },
    ]);
  });

  it("Applies data attribute to children", () => {
    expect(
      ApplySpecifier(
        [
          {
            tag: "div",
            attributes: {},
            children: [{ tag: "div", attributes: {}, children: [] }],
          },
        ],
        "test-specifier"
      )
    ).toEqual([
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
    ]);
  });

  it("Ignores none html tags", () => {
    expect(
      ApplySpecifier(
        [{ tag: "test", attributes: {}, children: [] }],
        "test-specifier"
      )
    ).toEqual([
      {
        tag: "test",
        attributes: {},
        children: [],
      },
    ]);
  });

  it("Applies data attribute to children of none html tags", () => {
    expect(
      ApplySpecifier(
        [
          {
            tag: "test",
            attributes: {},
            children: [{ tag: "div", attributes: {}, children: [] }],
          },
        ],
        "test-specifier"
      )
    ).toEqual([
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
    ]);
  });
});
