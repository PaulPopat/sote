import { ParseTpeFile } from "./tpe-file-parser";

describe("ParseTpeFile", () => {
  it("Parses a basic tpe file", () => {
    expect(ParseTpeFile("<template><div/></template>", "")).toEqual({
      xml_template: [{ tag: "div", attributes: {}, children: [] }],
      server_js: {},
    });
  });

  it("Throws if there is no xml template", () => {
    expect(() => ParseTpeFile("<div></div>", "")).toThrowError(
      "No xml template in TPE file"
    );
  });

  it("Parses server javascript", () => {
    expect(
      ParseTpeFile(
        "<template><div/></template><script area=\"server\">console.log('hello world')</script>",
        ""
      )
    ).toEqual({
      xml_template: [{ tag: "div", attributes: {}, children: [] }],
      server_js: { get: "console.log('hello world')" },
    });
  });

  it("Parses server javascript method", () => {
    expect(
      ParseTpeFile(
        '<template><div/></template><script area="server" method="post">console.log(\'hello world\')</script>',
        ""
      )
    ).toEqual({
      xml_template: [{ tag: "div", attributes: {}, children: [] }],
      server_js: { post: "console.log('hello world')" },
    });
  });

  it("Parses client javascript", () => {
    expect(
      ParseTpeFile(
        "<template><div/></template><script area=\"client\">console.log('hello world')</script>",
        ""
      )
    ).toEqual({
      xml_template: [{ tag: "div", attributes: {}, children: [] }],
      server_js: {},
      client_js: "console.log('hello world')",
    });
  });

  it("Parses client javascript with babel", () => {
    expect(
      ParseTpeFile(
        `<template><div/></template><script area="client" babel>const test = () => "test";</script>`,
        ""
      )
    ).toEqual({
      xml_template: [{ tag: "div", attributes: {}, children: [] }],
      server_js: {},
      client_js: `"use strict";

var test = function test() {
  return "test";
};`,
    });
  });

  it("Parses external client javascript", () => {
    expect(
      ParseTpeFile(
        '<template><div/></template><script area="client" src="./resources/example.js"></script>',
        ""
      )
    ).toEqual({
      xml_template: [{ tag: "div", attributes: {}, children: [] }],
      server_js: {},
      client_js: 'console.log("Example JavaScript");',
    });
  });

  it("Applies more than one client javascript file", () => {
    expect(
      ParseTpeFile(
        `
        <template><div/></template>
        <script area=\"client\">console.log('hello world')</script>
        <script area=\"client\">console.log('hello world')</script>`,
        ""
      )
    ).toEqual({
      xml_template: [{ tag: "div", attributes: {}, children: [] }],
      server_js: {},
      client_js: `console.log('hello world')
console.log('hello world')`,
    });
  });

  it("Parses file css", () => {
    expect(
      ParseTpeFile(
        "<template><div/></template><style>div{display:block}</style>",
        ""
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

  it("Parses file scss", () => {
    expect(
      ParseTpeFile(
        "<template><div/></template><style>div{color: $test-colour;}</style>",
        "$test-colour: #333;"
      )
    ).toEqual({
      xml_template: [
        {
          tag: "div",
          attributes: { "data-specifier": "7200416bd6d2af89c872ff6c6c4cab4f" },
          children: [],
        },
      ],
      server_js: {},
      css: `div[data-specifier="7200416bd6d2af89c872ff6c6c4cab4f"]{color:#333;}`,
    });
  });

  it("Does not apply hash to css if specified", () => {
    expect(
      ParseTpeFile(
        "<template><div/></template><style no-hash>div{display:block}</style>",
        ""
      )
    ).toEqual({
      xml_template: [
        {
          tag: "div",
          attributes: {},
          children: [],
        },
      ],
      server_js: {},
      css: `div{display:block}`,
    });
  });

  it("It hashes some css with specified", () => {
    expect(
      ParseTpeFile(
        "<template><div/></template><style no-hash>div{display:block}</style><style>div{display:block}</style>",
        ""
      )
    ).toEqual({
      xml_template: [
        {
          tag: "div",
          attributes: {
            "data-specifier": "3d6fc0fe9d4b1a168a6ae116baaf8143",
          },
          children: [],
        },
      ],
      server_js: {},
      css: `div[data-specifier=\"3d6fc0fe9d4b1a168a6ae116baaf8143\"]{display:block;}div{display:block}`,
    });
  });

  it("Parses external client css", () => {
    expect(
      ParseTpeFile(
        '<template><div/></template><style src="./resources/example.css"></style>',
        ""
      )
    ).toEqual({
      xml_template: [
        {
          tag: "div",
          attributes: { "data-specifier": "431f815af07b7fb63b3c915a8f50ef79" },
          children: [],
        },
      ],
      server_js: {},
      css:
        '.example[data-specifier="431f815af07b7fb63b3c915a8f50ef79"]{display:block;}',
    });
  });

  it("Applies more than one css element", () => {
    expect(
      ParseTpeFile(
        `
        <template><div/></template>
        <style>div{display:block;}</style>
        <style>div{display:block;}</style>`,
        ""
      )
    ).toEqual({
      xml_template: [
        {
          tag: "div",
          attributes: { "data-specifier": "18daf102c210d25106de6f3d82286888" },
          children: [],
        },
      ],
      server_js: {},
      css: `div[data-specifier="18daf102c210d25106de6f3d82286888"]{display:block;}div[data-specifier="18daf102c210d25106de6f3d82286888"]{display:block;}`,
    });
  });

  it("Parses page title", () => {
    expect(
      ParseTpeFile(
        "<template><div/></template><title>console.log('hello world')</title>",
        ""
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
        <title>console.log('hello world')</title>`,
        ""
      )
    ).toThrowError("More than one title element");
  });

  it("Throws the title is invalid", () => {
    expect(() =>
      ParseTpeFile(
        `
        <template><div/></template>
        <title><div>hello world</div></title>`,
        ""
      )
    ).toThrowError("title 0 is not a valid script");
  });

  it("Parses page description", () => {
    expect(
      ParseTpeFile(
        "<template><div/></template><description>console.log('hello world')</description>",
        ""
      )
    ).toEqual({
      xml_template: [{ tag: "div", attributes: {}, children: [] }],
      server_js: {},
      description: "console.log('hello world')",
    });
  });

  it("Throws if there is more than one page description", () => {
    expect(() =>
      ParseTpeFile(
        `
        <template><div/></template>
        <description>console.log('hello world')</description>
        <description>console.log('hello world')</description>`,
        ""
      )
    ).toThrowError("More than one description element");
  });

  it("Throws the description is invalid", () => {
    expect(() =>
      ParseTpeFile(
        `
        <template><div/></template>
        <description><div>hello world</div></description>`,
        ""
      )
    ).toThrowError("description 0 is not a valid script");
  });

  it("Parses page language", () => {
    expect(
      ParseTpeFile(
        "<template><div/></template><lang>console.log('hello world')</lang>",
        ""
      )
    ).toEqual({
      xml_template: [{ tag: "div", attributes: {}, children: [] }],
      server_js: {},
      language: "console.log('hello world')",
    });
  });

  it("Throws if there is more than one page language", () => {
    expect(() =>
      ParseTpeFile(
        `
        <template><div/></template>
        <lang>console.log('hello world')</lang>
        <lang>console.log('hello world')</lang>`,
        ""
      )
    ).toThrowError("More than one lang element");
  });

  it("Throws the language is invalid", () => {
    expect(() =>
      ParseTpeFile(
        `
        <template><div/></template>
        <lang><div>hello world</div></lang>`,
        ""
      )
    ).toThrowError("lang 0 is not a valid script");
  });
});
