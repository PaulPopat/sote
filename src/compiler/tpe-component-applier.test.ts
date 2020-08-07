import { ApplyComponents } from "./tpe-component-applier";

describe("ApplyComponents", () => {
  it("Applies a simple component", () => {
    expect(
      ApplyComponents(
        [{ tag: "test-component", attributes: {}, children: [] }],
        {
          "test-component": {
            xml_template: [{ tag: "div", attributes: {}, children: [] }],
          },
        }
      )
    ).toEqual({
      tpe: [{ tag: "div", attributes: {}, children: [] }],
      components: ["test-component"],
    });
  });

  it("Applies a component in children", () => {
    expect(
      ApplyComponents(
        [
          {
            tag: "span",
            attributes: {},
            children: [{ tag: "test-component", attributes: {}, children: [] }],
          },
        ],
        {
          "test-component": {
            xml_template: [{ tag: "div", attributes: {}, children: [] }],
          },
        }
      )
    ).toEqual({
      tpe: [
        {
          tag: "span",
          attributes: {},
          children: [{ tag: "div", attributes: {}, children: [] }],
        },
      ],
      components: ["test-component"],
    });
  });

  it("Applies a component in children of components", () => {
    expect(
      ApplyComponents(
        [
          {
            tag: "test-component",
            attributes: {},
            children: [{ tag: "span", attributes: {}, children: [] }],
          },
        ],
        {
          "test-component": {
            xml_template: [
              {
                tag: "div",
                attributes: {},
                children: [{ tag: "children", attributes: {}, children: [] }],
              },
            ],
          },
        }
      )
    ).toEqual({
      tpe: [
        {
          tag: "div",
          attributes: {},
          children: [{ tag: "span", attributes: {}, children: [] }],
        },
      ],
      components: ["test-component"],
    });
  });

  it("Only includes used components once", () => {
    expect(
      ApplyComponents(
        [
          {
            tag: "test-component",
            attributes: {},
            children: [{ tag: "test-component", attributes: {}, children: [] }],
          },
        ],
        {
          "test-component": {
            xml_template: [
              {
                tag: "div",
                attributes: {},
                children: [{ tag: "children", attributes: {}, children: [] }],
              },
            ],
          },
        }
      )
    ).toEqual({
      tpe: [
        {
          tag: "div",
          attributes: {},
          children: [{ tag: "div", attributes: {}, children: [] }],
        },
      ],
      components: ["test-component"],
    });
  });

  it("Applies attribute props on a component", () => {
    expect(
      ApplyComponents(
        [
          {
            tag: "test-component",
            attributes: { tester: "props.test" },
            children: [],
          },
        ],
        {
          "test-component": {
            xml_template: [
              {
                tag: "div",
                attributes: { class: ":props.tester" },
                children: [],
              },
            ],
          },
        }
      )
    ).toEqual({
      tpe: [
        { tag: "div", attributes: { class: ":(props.test)" }, children: [] },
      ],
      components: ["test-component"],
    });
  });

  it("Applies attribute props on a component with whitespace", () => {
    expect(
      ApplyComponents(
        [
          {
            tag: "test-component",
            attributes: { tester: "props.test" },
            children: [],
          },
        ],
        {
          "test-component": {
            xml_template: [
              {
                tag: "div",
                attributes: { class: ":props   .    tester" },
                children: [],
              },
            ],
          },
        }
      )
    ).toEqual({
      tpe: [
        { tag: "div", attributes: { class: ":(props.test)" }, children: [] },
      ],
      components: ["test-component"],
    });
  });

  it("Applies props as part of an expression", () => {
    expect(
      ApplyComponents(
        [
          {
            tag: "test-component",
            attributes: { tester: "props.test" },
            children: [],
          },
        ],
        {
          "test-component": {
            xml_template: [
              {
                tag: "div",
                attributes: { class: ":props.tester + 'test'" },
                children: [],
              },
            ],
          },
        }
      )
    ).toEqual({
      tpe: [
        { tag: "div", attributes: { class: ":(props.test) + 'test'" }, children: [] },
      ],
      components: ["test-component"],
    });
  });

  it("Transforms deep expressions", () => {
    expect(
      ApplyComponents(
        [
          {
            tag: "test-component",
            attributes: { test: ":props.another" },
            children: [],
          },
        ],
        {
          "test-component": {
            xml_template: [
              {
                tag: "div",
                attributes: { class: ":props.test.something" },
                children: [],
              },
            ],
          },
        }
      )
    ).toEqual({
      tpe: [
        { tag: "div", attributes: { class: ":(props.another).something" }, children: [] },
      ],
      components: ["test-component"],
    });
  });
});
