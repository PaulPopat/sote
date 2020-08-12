import { ParseTpeFile } from "./tpe-file-parser";

describe("ParseTpeFile", () => {
  it("Parses a basic tpe file", () => {
    expect(ParseTpeFile("<template><div/></template>")).toEqual({
      xml_template: [{ tag: "div", attributes: {}, children: [] }],
      server_js: {},
    });
  });

  it("Throws if there is no xml template", () => {
    expect(() => ParseTpeFile("<div></div>")).toThrowError(
      "No xml template in TPE file"
    );
  });

  it("Parses server javascript", () => {
    expect(
      ParseTpeFile(
        "<template><div/></template><script area=\"server\">console.log('hello world')</script>"
      )
    ).toEqual({
      xml_template: [{ tag: "div", attributes: {}, children: [] }],
      server_js: { get: "console.log('hello world')" },
    });
  });

  it("Parses server javascript method", () => {
    expect(
      ParseTpeFile(
        '<template><div/></template><script area="server" method="post">console.log(\'hello world\')</script>'
      )
    ).toEqual({
      xml_template: [{ tag: "div", attributes: {}, children: [] }],
      server_js: { post: "console.log('hello world')" },
    });
  });

  it("Parses client javascript", () => {
    expect(
      ParseTpeFile(
        "<template><div/></template><script area=\"client\">console.log('hello world')</script>"
      )
    ).toEqual({
      xml_template: [{ tag: "div", attributes: {}, children: [] }],
      server_js: {},
      client_js: "console.log('hello world')",
    });
  });

  it("Throws if there is more than one client javascript file", () => {
    expect(() =>
      ParseTpeFile(
        `
        <template><div/></template>
        <script area=\"client\">console.log('hello world')</script>
        <script area=\"client\">console.log('hello world')</script>`
      )
    ).toThrowError("More than one client script element");
  });

  it("Parses file css", () => {
    expect(
      ParseTpeFile(
        "<template><div/></template><style>div{display:block}</style>"
      )
    ).toEqual({
      xml_template: [
        {
          tag: "div",
          attributes: { "data-specifier": "08da3a1771d2251c8fc150c3f1dfd6b6" },
          children: [],
        },
      ],
      server_js: {},
      css: `div[data-specifier="08da3a1771d2251c8fc150c3f1dfd6b6"]{display:block;}`,
    });
  });

  it("Throws if there is more than one css element", () => {
    expect(() =>
      ParseTpeFile(
        `
        <template><div/></template>
        <style>div{display:block;}</style>
        <style>div{display:block;}</style>`
      )
    ).toThrowError("More than one style element");
  });

  it("Parses page title", () => {
    expect(
      ParseTpeFile(
        "<template><div/></template><title>console.log('hello world')</title>"
      )
    ).toEqual({
      xml_template: [{ tag: "div", attributes: {}, children: [] }],
      server_js: {},
      title: "console.log('hello world')",
    });
  });

  it("Throws if there is more than one page title", () => {
    expect(() =>
      ParseTpeFile(
        `
        <template><div/></template>
        <title>console.log('hello world')</title>
        <title>console.log('hello world')</title>`
      )
    ).toThrowError("More than one title element");
  });

  it("Throws the title is invalid", () => {
    expect(() =>
      ParseTpeFile(
        `
        <template><div/></template>
        <title><div>hello world</div></title>`
      )
    ).toThrowError("title is not a valid script");
  });

  it("Parses page description", () => {
    expect(
      ParseTpeFile(
        "<template><div/></template><description>console.log('hello world')</description>"
      )
    ).toEqual({
      xml_template: [{ tag: "div", attributes: {}, children: [] }],
      server_js: {},
      description: "console.log('hello world')",
    });
  });

  it("Throws if there is more than one page title", () => {
    expect(() =>
      ParseTpeFile(
        `
        <template><div/></template>
        <description>console.log('hello world')</description>
        <description>console.log('hello world')</description>`
      )
    ).toThrowError("More than one description element");
  });

  it("Throws the description is invalid", () => {
    expect(() =>
      ParseTpeFile(
        `
        <template><div/></template>
        <description><div>hello world</div></description>`
      )
    ).toThrowError("description is not a valid script");
  });
});
