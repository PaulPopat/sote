import { ApplyComponents } from "./tpe-component-applier";

jest.mock("uuid", () => {
  let index = 0;
  return {
    v4: () => (++index).toString(),
  };
});

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
      tpe: [{ tag: "div", attributes: {}, children: [], props: "1" }],
      components: ["test-component"],
      props: [{ children: [], id: "1", props: {} }],
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
          children: [{ tag: "div", attributes: {}, children: [], props: "2" }],
        },
      ],
      components: ["test-component"],
      props: [{ children: [], id: "2", props: {} }],
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
          props: "3",
        },
      ],
      components: ["test-component"],
      props: [{ children: [], id: "3", props: {} }],
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
          children: [{ tag: "div", attributes: {}, children: [], props: "4" }],
          props: "5",
        },
      ],
      components: ["test-component"],
      props: [
        { children: [], id: "4", props: {} },
        { children: [], id: "5", props: {} },
      ],
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
          props: "6",
        },
      ],
      components: ["test-component"],
      props: [{ children: [], id: "6", props: { tester: ":props.test" } }],
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
              props: "8",
            },
          ],
          props: "7",
        },
      ],
      components: ["test-component", "second-test-component"],
      props: [
        {
          children: [
            {
              children: [],
              id: "8",
              props: { second_tester: ":props.tester" },
            },
          ],
          id: "7",
          props: { tester: ":props.test" },
        },
      ],
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
          props: "9",
        },
      ],
      components: ["test-component"],
      props: [{ children: [], id: "9", props: { tester: ":props.test" } }],
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
              props: "10",
            },
          ],
          props: "10",
        },
      ],
      components: ["test-component"],
      props: [{ children: [], id: "10", props: { tester: ":props.test" } }],
    });
  });

  it("Applies post processing server statement for component", () => {
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
            server_js: { get: "console.log('test')" },
          },
        }
      )
    ).toEqual({
      tpe: [
        {
          tag: "div",
          attributes: {},
          children: [{ tag: "span", attributes: {}, children: [] }],
          props: "11",
        },
      ],
      components: ["test-component"],
      props: [
        {
          children: [],
          id: "11",
          props: {},
          post_process: "console.log('test')",
        },
      ],
    });
  });
});
