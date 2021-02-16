import { ParseTpeFile } from "./tpe-file-parser.ts";
import {
  assertEquals,
  assertThrowsAsync,
} from "https://deno.land/std@0.86.0/testing/asserts.ts";

Deno.test("Parses a basic tpe file", async () => {
  assertEquals(await ParseTpeFile("<template><div/></template>", "./"), {
    client_js: undefined,
    css: undefined,
    description: undefined,
    language: undefined,
    title: undefined,
    xml_template: [{ tag: "div", attributes: {}, children: [] }],
    server_js: {},
  });
});

Deno.test("Throws if there is no xml template", async () => {
  await assertThrowsAsync(() => ParseTpeFile("<div></div>", "./"));
});

Deno.test("Parses server javascript", async () => {
  assertEquals(
    await ParseTpeFile(
      "<template><div/></template><script area=\"server\">console.log('hello world')</script>",
      "./"
    ),
    {
      client_js: undefined,
      css: undefined,
      description: undefined,
      language: undefined,
      title: undefined,
      xml_template: [{ tag: "div", attributes: {}, children: [] }],
      server_js: { get: "console.log('hello world')" },
    }
  );
});

Deno.test("Parses server javascript method", async () => {
  assertEquals(
    await ParseTpeFile(
      '<template><div/></template><script area="server" method="post">console.log(\'hello world\')</script>',
      "./"
    ),
    {
      client_js: undefined,
      css: undefined,
      description: undefined,
      language: undefined,
      title: undefined,
      xml_template: [{ tag: "div", attributes: {}, children: [] }],
      server_js: { post: "console.log('hello world')" },
    }
  );
});

Deno.test("Parses client javascript", async () => {
  assertEquals(
    await ParseTpeFile(
      "<template><div/></template><script area=\"client\">console.log('hello world')</script>",
      "./"
    ),
    {
      css: undefined,
      description: undefined,
      language: undefined,
      title: undefined,
      xml_template: [{ tag: "div", attributes: {}, children: [] }],
      server_js: {},
      client_js: "console.log('hello world')",
    }
  );
});

Deno.test("Parses client javascript with babel", async () => {
  assertEquals(
    await ParseTpeFile(
      `<template><div/></template>
      <script area="client" bundle>console.log('test');</script>`,
      "./"
    ),
    {
      css: undefined,
      description: undefined,
      language: undefined,
      title: undefined,
      xml_template: [{ tag: "div", attributes: {}, children: [] }],
      server_js: {},
      client_js: `console.log('test');`,
    }
  );
});

Deno.test("Parses external client javascript", async () => {
  assertEquals(
    await ParseTpeFile(
      '<template><div/></template><script area="client" src="./resources/example.js"></script>',
      "./"
    ),
    {
      css: undefined,
      description: undefined,
      language: undefined,
      title: undefined,
      xml_template: [{ tag: "div", attributes: {}, children: [] }],
      server_js: {},
      client_js: 'console.log("Example JavaScript");',
    }
  );
});

Deno.test("Applies more than one client javascript file", async () => {
  assertEquals(
    await ParseTpeFile(
      `
        <template><div/></template>
        <script area=\"client\">console.log('hello world')</script>
        <script area=\"client\">console.log('hello world')</script>`,
      "./"
    ),
    {
      css: undefined,
      description: undefined,
      language: undefined,
      title: undefined,
      xml_template: [{ tag: "div", attributes: {}, children: [] }],
      server_js: {},
      client_js: `console.log('hello world')
console.log('hello world')`,
    }
  );
});

Deno.test("Parses file css", async () => {
  assertEquals(
    await ParseTpeFile(
      "<template><div/></template><style>div{display:block}</style>",
      "./"
    ),
    {
      client_js: undefined,
      description: undefined,
      language: undefined,
      title: undefined,
      xml_template: [
        {
          tag: "div",
          attributes: { "data-specifier": "08da3a1771d2251c8fc150c3f1dfd6b6" },
          children: [],
        },
      ],
      server_js: {},
      css: `div[data-specifier="08da3a1771d2251c8fc150c3f1dfd6b6"]{display:block;}`,
    }
  );
});

Deno.test("Does not apply hash to css if specified", async () => {
  assertEquals(
    await ParseTpeFile(
      "<template><div/></template><style no-hash>div{display:block}</style>",
      "./"
    ),
    {
      client_js: undefined,
      description: undefined,
      language: undefined,
      title: undefined,
      xml_template: [
        {
          tag: "div",
          attributes: {},
          children: [],
        },
      ],
      server_js: {},
      css: `div{display:block;}`,
    }
  );
});

Deno.test("Hashes some css with specified", async () => {
  assertEquals(
    await ParseTpeFile(
      "<template><div/></template><style no-hash>div{display:block}</style><style>div{display:block}</style>",
      "./"
    ),
    {
      client_js: undefined,
      description: undefined,
      language: undefined,
      title: undefined,
      xml_template: [
        {
          tag: "div",
          attributes: { "data-specifier": "3d6fc0fe9d4b1a168a6ae116baaf8143" },
          children: [],
        },
      ],
      server_js: {},
      css: `div[data-specifier=\"3d6fc0fe9d4b1a168a6ae116baaf8143\"]{display:block;}div{display:block;}`,
    }
  );
});

Deno.test("Parses external client css", async () => {
  assertEquals(
    await ParseTpeFile(
      '<template><div/></template><style src="./resources/example.css"></style>',
      "./"
    ),
    {
      client_js: undefined,
      description: undefined,
      language: undefined,
      title: undefined,
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
    }
  );
});

Deno.test("Applies more than one css element", async () => {
  assertEquals(
    await ParseTpeFile(
      `
        <template><div/></template>
        <style>div{display:block;}</style>
        <style>div{display:block;}</style>`,
      "./"
    ),
    {
      client_js: undefined,
      description: undefined,
      language: undefined,
      title: undefined,
      xml_template: [
        {
          tag: "div",
          attributes: { "data-specifier": "18daf102c210d25106de6f3d82286888" },
          children: [],
        },
      ],
      server_js: {},
      css: `div[data-specifier="18daf102c210d25106de6f3d82286888"]{display:block;}div[data-specifier="18daf102c210d25106de6f3d82286888"]{display:block;}`,
    }
  );
});

Deno.test("Parses page title", async () => {
  assertEquals(
    await ParseTpeFile(
      "<template><div/></template><title>console.log('hello world')</title>",
      "./"
    ),
    {
      client_js: undefined,
      css: undefined,
      description: undefined,
      language: undefined,
      xml_template: [{ tag: "div", attributes: {}, children: [] }],
      server_js: {},
      title: "console.log('hello world')",
    }
  );
});

Deno.test("Throws if there is more than one page title", async () => {
  await assertThrowsAsync(
    async () =>
      await ParseTpeFile(
        `
        <template><div/></template>
        <title>console.log('hello world')</title>
        <title>console.log('hello world')</title>`,
        "./"
      )
  );
});

Deno.test("Throws the title is invalid", async () => {
  await assertThrowsAsync(
    async () =>
      await ParseTpeFile(
        `
        <template><div/></template>
        <title><div>hello world</div></title>`,
        "./"
      )
  );
});

Deno.test("Parses page description", async () => {
  assertEquals(
    await ParseTpeFile(
      "<template><div/></template><description>console.log('hello world')</description>",
      "./"
    ),
    {
      client_js: undefined,
      css: undefined,
      language: undefined,
      title: undefined,
      xml_template: [{ tag: "div", attributes: {}, children: [] }],
      server_js: {},
      description: "console.log('hello world')",
    }
  );
});

Deno.test("Throws if there is more than one page description", async () => {
  await assertThrowsAsync(() =>
    ParseTpeFile(
      `
        <template><div/></template>
        <description>console.log('hello world')</description>
        <description>console.log('hello world')</description>`,
      "./"
    )
  );
});

Deno.test("Throws the description is invalid", async () => {
  await assertThrowsAsync(() =>
    ParseTpeFile(
      `
        <template><div/></template>
        <description><div>hello world</div></description>`,
      "./"
    )
  );
});

Deno.test("Parses page language", async () => {
  assertEquals(
    await ParseTpeFile(
      "<template><div/></template><lang>console.log('hello world')</lang>",
      "./"
    ),
    {
      client_js: undefined,
      css: undefined,
      description: undefined,
      title: undefined,
      xml_template: [{ tag: "div", attributes: {}, children: [] }],
      server_js: {},
      language: "console.log('hello world')",
    }
  );
});

Deno.test("Throws if there is more than one page language", async () => {
  await assertThrowsAsync(() =>
    ParseTpeFile(
      `
        <template><div/></template>
        <lang>console.log('hello world')</lang>
        <lang>console.log('hello world')</lang>`,
      "./"
    )
  );
});

Deno.test("Throws the language is invalid", async () => {
  await assertThrowsAsync(() =>
    ParseTpeFile(
      `
        <template><div/></template>
        <lang><div>hello world</div></lang>`,
      "./"
    )
  );
});
