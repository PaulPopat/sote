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
      tpe: [{ tag: "div", attributes: {}, children: [], props: [{}] }],
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
          children: [{ tag: "div", attributes: {}, children: [], props: [{}] }],
          props: [],
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
          children: [{ tag: "span", attributes: {}, children: [], props: [] }],
          props: [{}],
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
          children: [{ tag: "div", attributes: {}, children: [], props: [{}] }],
          props: [{}],
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
            attributes: { tester: ":props.test" },
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
        {
          tag: "div",
          attributes: { class: ":props.tester" },
          children: [],
          props: [{ tester: ":props.test" }],
        },
      ],
      components: ["test-component"],
    });
  });

  it("Applies deeps props to a component", () => {
    expect(
      ApplyComponents(
        [
          {
            tag: "test-component",
            attributes: { tester: ":props.test" },
            children: [],
          },
        ],
        {
          "test-component": {
            xml_template: [
              {
                tag: "div",
                attributes: { class: ":props.tester" },
                children: [
                  {
                    tag: "second-test-component",
                    attributes: {
                      second_tester: ":props.tester",
                    },
                    children: [],
                  },
                ],
              },
            ],
          },
          "second-test-component": {
            xml_template: [
              {
                tag: "div",
                attributes: { class: ":props.second_tester" },
                children: [],
              },
            ],
          },
        }
      )
    ).toEqual({
      tpe: [
        {
          tag: "div",
          attributes: { class: ":props.tester" },
          children: [
            {
              tag: "div",
              attributes: { class: ":props.second_tester" },
              children: [],
              props: [
                { tester: ":props.test" },
                { second_tester: ":props.tester" },
              ],
            },
          ],
          props: [{ tester: ":props.test" }],
        },
      ],
      components: ["test-component", "second-test-component"],
    });
  });

  it("Applies attribute string accessor props on a component", () => {
    expect(
      ApplyComponents(
        [
          {
            tag: "test-component",
            attributes: { tester: ":props.test" },
            children: [],
          },
        ],
        {
          "test-component": {
            xml_template: [
              {
                tag: "div",
                attributes: { class: ":props['tester']" },
                children: [],
              },
            ],
          },
        }
      )
    ).toEqual({
      tpe: [
        {
          tag: "div",
          attributes: { class: ":props['tester']" },
          children: [],
          props: [{ tester: ":props.test" }],
        },
      ],
      components: ["test-component"],
    });
  });

  it("Applies attribute props on a component in text", () => {
    expect(
      ApplyComponents(
        [
          {
            tag: "test-component",
            attributes: { tester: ":props.test" },
            children: [],
          },
        ],
        {
          "test-component": {
            xml_template: [
              {
                tag: "div",
                attributes: {},
                children: [{ text: "Hello {props.tester} world" }],
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
          children: [
            {
              text: "Hello {props.tester} world",
              props: [{ tester: ":props.test" }],
            },
          ],
          props: [{ tester: ":props.test" }],
        },
      ],
      components: ["test-component"],
    });
  });
});
