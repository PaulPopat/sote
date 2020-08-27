import { GetUsed } from "./tpe-component-applier";

jest.mock("uuid", () => {
  let index = 0;
  return {
    v4: () => (++index).toString(),
  };
});

describe("ApplyComponents", () => {
  it("Applies a simple component", () => {
    expect(
      GetUsed([{ tag: "test-component", attributes: {}, children: [] }], {
        "test-component": {
          xml_template: [{ tag: "div", attributes: {}, children: [] }],
        },
      })
    ).toEqual(["test-component"]);
  });

  it("Applies a component in children", () => {
    expect(
      GetUsed(
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
    ).toEqual(["test-component"]);
  });

  it("Applies a component in children of components", () => {
    expect(
      GetUsed(
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
    ).toEqual(["test-component"]);
  });

  it("Only includes used components once", () => {
    expect(
      GetUsed(
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
    ).toEqual(["test-component"]);
  });

  it("Applies components within components", () => {
    expect(
      GetUsed(
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
    ).toEqual(["test-component", "second-test-component"]);
  });
});
