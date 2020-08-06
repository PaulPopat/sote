import { ParseXml, ToXml } from "./xml-parser";

describe("ParseXml", () => {
  it("Parses a simple tag", () => {
    expect(ParseXml("<div/>")).toEqual([
      {
        tag: "div",
        attributes: {},
        children: [],
      },
    ]);
  });

  it("Parses attributes", () => {
    expect(ParseXml("<div class='test'/>")).toEqual([
      {
        tag: "div",
        attributes: { class: "test" },
        children: [],
      },
    ]);
  });

  it("Parses text", () => {
    expect(ParseXml("<div>test text</div>")).toEqual([
      {
        tag: "div",
        attributes: {},
        children: [{ text: "test text" }],
      },
    ]);
  });

  it("Parses child elements", () => {
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

  it("Parses attributes on child elements", () => {
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

  it("Parses child text and elements", () => {
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

  it("Parses multiple root elements", () => {
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

  it("Parses multiple root elements with children and the same tag", () => {
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
