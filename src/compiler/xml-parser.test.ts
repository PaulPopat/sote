import { ParseXml, ToXml } from "./xml-parser";

describe("ParseXml", () => {
  test("Parses a simple tag", () => {
    expect(ParseXml("<div/>")).toEqual([
      {
        tag: "div",
        attributes: {},
        children: [],
      },
    ]);
  });

  test("Parses attributes", () => {
    expect(ParseXml("<div class='test'/>")).toEqual([
      {
        tag: "div",
        attributes: { class: "test" },
        children: [],
      },
    ]);
  });

  test("Parses text", () => {
    expect(ParseXml("<div>test text</div>")).toEqual([
      {
        tag: "div",
        attributes: {},
        children: [{ text: "test text" }],
      },
    ]);
  });

  test("Parses special characters in style tags", () => {
    expect(ParseXml('<style><></>""=</style>')).toEqual([
      {
        tag: "style",
        attributes: {},
        children: [
          {
            text: '<></>""=',
          },
        ],
      },
    ]);
  });

  test("Parses special characters in script tags", () => {
    expect(ParseXml('<script><></>""=</script>')).toEqual([
      {
        tag: "script",
        attributes: {},
        children: [
          {
            text: '<></>""=',
          },
        ],
      },
    ]);
  });

  test("Parses child elements", () => {
    expect(ParseXml("<div><span>test text</span></div>")).toEqual([
      {
        tag: "div",
        attributes: {},
        children: [
          { tag: "span", attributes: {}, children: [{ text: "test text" }] },
        ],
      },
    ]);
  });

  test("Parses attributes on child elements", () => {
    expect(ParseXml('<div><span test="other" /></div>')).toEqual([
      {
        tag: "div",
        attributes: {},
        children: [
          { tag: "span", attributes: { test: "other" }, children: [] },
        ],
      },
    ]);
  });

  test("Parses child text and elements", () => {
    expect(ParseXml("<div>test test <span>test text</span></div>")).toEqual([
      {
        tag: "div",
        attributes: {},
        children: [
          { text: "test test" },
          { tag: "span", attributes: {}, children: [{ text: "test text" }] },
        ],
      },
    ]);
  });

  test("Parses child elements with text on either side", () => {
    expect(
      ParseXml("<div>test test <span>test text</span> test test</div>")
    ).toEqual([
      {
        tag: "div",
        attributes: {},
        children: [
          { text: "test test" },
          { tag: "span", attributes: {}, children: [{ text: "test text" }] },
          { text: "test test" },
        ],
      },
    ]);
  });

  test("Parses multiple root elements", () => {
    expect(ParseXml("<div/><span/>")).toEqual([
      {
        tag: "div",
        attributes: {},
        children: [],
      },
      {
        tag: "span",
        attributes: {},
        children: [],
      },
    ]);
  });

  test("Parses multiple root elements with children and the same tag", () => {
    expect(ParseXml("<div>test1</div><div>test2</div>")).toEqual([
      {
        tag: "div",
        attributes: {},
        children: [{ text: "test1" }],
      },
      {
        tag: "div",
        attributes: {},
        children: [{ text: "test2" }],
      },
    ]);
  });

  test("Parses multiple child elements with children and the same tag", () => {
    expect(ParseXml("<div><script>test1</script><div>test2</div></div>")).toEqual([
      {
        tag: "div",
        attributes: {},
        children: [
          {
            tag: "script",
            attributes: {},
            children: [{ text: "test1" }],
          },
          {
            tag: "div",
            attributes: {},
            children: [{ text: "test2" }],
          },
        ],
      },
    ]);
  });

  test("Parses multiple root elements with children and the same tag with attributes", () => {
    expect(
      ParseXml("<div class='test1'>test1</div><div class='test2'>test2</div>")
    ).toEqual([
      {
        tag: "div",
        attributes: { class: "test1" },
        children: [{ text: "test1" }],
      },
      {
        tag: "div",
        attributes: { class: "test2" },
        children: [{ text: "test2" }],
      },
    ]);
  });

  test("Ignores HTML in an expression", () => {
    expect(
      ParseXml("<div>{<div></div>}</div>")
    ).toEqual([
      {
        tag: "div",
        attributes: { },
        children: [{ text: "{<div></div>}" }],
      },
    ]);
  });
});

describe("ToXml", () => {
  it("Writes an xml tag", () => {
    expect(ToXml([{ tag: "div", attributes: {}, children: [] }])).toBe(
      "<div/>"
    );
  });

  it("Writes multiple root xml tags", () => {
    expect(
      ToXml([
        { tag: "div", attributes: {}, children: [] },
        { tag: "span", attributes: {}, children: [] },
      ])
    ).toBe("<div/><span/>");
  });

  it("Write xml text", () => {
    expect(ToXml([{ text: "Hello world" }])).toBe("Hello world");
  });

  it("Writes xml attributes", () => {
    expect(
      ToXml([{ tag: "div", attributes: { class: "test" }, children: [] }])
    ).toBe('<div class="test"/>');
  });

  it("Escapes xml attributes", () => {
    expect(
      ToXml([{ tag: "div", attributes: { class: 'te"<>/st' }, children: [] }])
    ).toBe('<div class="te&quot;&lt;&gt;/st"/>');
  });

  it("Writes xml child text", () => {
    expect(
      ToXml([{ tag: "div", attributes: {}, children: [{ text: "test" }] }])
    ).toBe("<div>test</div>");
  });

  it("Escapes xml child text", () => {
    expect(
      ToXml([{ tag: "div", attributes: {}, children: [{ text: 'te"<>/st' }] }])
    ).toBe("<div>te&quot;&lt;&gt;/st</div>");
  });

  it("Writes xml child elements", () => {
    expect(
      ToXml([
        {
          tag: "div",
          attributes: {},
          children: [{ tag: "div", attributes: {}, children: [] }],
        },
      ])
    ).toBe("<div><div/></div>");
  });
});
