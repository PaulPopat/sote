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
        "<template><div/></template><server-js>console.log('hello world')</server-js>"
      )
    ).toEqual({
      xml_template: [{ tag: "div", attributes: {}, children: [] }],
      server_js: { get: "console.log('hello world')" },
    });
  });

  it("Parses client javascript", () => {
    expect(
      ParseTpeFile(
        "<template><div/></template><client-js>console.log('hello world')</client-js>"
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
        <client-js>console.log('hello world')</client-js>
        <client-js>console.log('hello world')</client-js>`
      )
    ).toThrowError("More than one client-js element");
  });

  it("Throws the client javascript is invalid", () => {
    expect(() =>
      ParseTpeFile(
        `
        <template><div/></template>
        <client-js><div>hello world</div></client-js>`
      )
    ).toThrowError("client-js is not a valid script");
  });

  it("Parses file css", () => {
    expect(
      ParseTpeFile(
        "<template><div/></template><css>console.log('hello world')</css>"
      )
    ).toEqual({
      xml_template: [{ tag: "div", attributes: {}, children: [] }],
      server_js: {},
      css: "console.log('hello world')",
    });
  });

  it("Throws if there is more than one css element", () => {
    expect(() =>
      ParseTpeFile(
        `
        <template><div/></template>
        <css>console.log('hello world')</css>
        <css>console.log('hello world')</css>`
      )
    ).toThrowError("More than one css element");
  });

  it("Throws the css is invalid", () => {
    expect(() =>
      ParseTpeFile(
        `
        <template><div/></template>
        <css><div>hello world</div></css>`
      )
    ).toThrowError("css is not a valid script");
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
});
