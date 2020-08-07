import { ParseXml, ToXml } from "./xml-parser";

describe("ParseXml", () => {
  test("Parses a simple tag", async () => {
    expect(await ParseXml("<div/>")).toEqual([
      {
        tag: "div",
        attributes: {},
        children: [],
      },
    ]);
  });

  test("Parses attributes", async () => {
    expect(await ParseXml("<div class='test'/>")).toEqual([
      {
        tag: "div",
        attributes: { class: "test" },
        children: [],
      },
    ]);
  });

  test("Parses text", async () => {
    expect(await ParseXml("<div>test text</div>")).toEqual([
      {
        tag: "div",
        attributes: {},
        children: [{ text: "test text" }],
      },
    ]);
  });

  test("Parses child elements", async () => {
    expect(await ParseXml("<div><span>test text</span></div>")).toEqual([
      {
        tag: "div",
        attributes: {},
        children: [
          { tag: "span", attributes: {}, children: [{ text: "test text" }] },
        ],
      },
    ]);
  });

  test("Parses attributes on child elements", async () => {
    expect(await ParseXml('<div><span test="other" /></div>')).toEqual([
      {
        tag: "div",
        attributes: {},
        children: [
          { tag: "span", attributes: { test: "other" }, children: [] },
        ],
      },
    ]);
  });

  test("Parses child text and elements", async () => {
    expect(
      await ParseXml("<div>test test <span>test text</span></div>")
    ).toEqual([
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

  test("Parses child elements with text on either side", async () => {
    expect(
      await ParseXml("<div>test test <span>test text</span> test test</div>")
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

  test("Parses multiple root elements", async () => {
    expect(await ParseXml("<div/><span/>")).toEqual([
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

  test("Parses multiple root elements with children and the same tag", async () => {
    expect(await ParseXml("<div>test1</div><div>test2</div>")).toEqual([
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

  test("Parses multiple root elements with children and the same tag with attributes", async () => {
    expect(
      await ParseXml(
        "<div class='test1'>test1</div><div class='test2'>test2</div>"
      )
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
