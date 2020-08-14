import { CompileApp } from "./page-builder";

it("Compiles a basic page", () => {
  expect(
    CompileApp(
      [
        {
          path: "/test",
          text: `
<template>
  <div />
</template>
<title>A test page</title>
<description>A test description</description>`,
        },
      ],
      [],
      false
    )
  ).toEqual({
    css_bundle: "",
    js_bundle: "",
    pages: [
      {
        model: {
          client_js: "",
          css: "",
          description: "A test description",
          server_js: {
            get: "return query",
          },
          title: "A test page",
          xml_template: [
            {
              attributes: {},
              children: [],
              props: [],
              tag: "div",
            },
          ],
        },
        url: "/test",
      },
    ],
  });
});

it("Compiles client javascript", () => {
  expect(
    CompileApp(
      [
        {
          path: "/test",
          text: `
<template>
  <div />
</template>
<script area="client">
  console.log("Hello world")
</script>
<title>A test page</title>
<description>A test description</description>`,
        },
      ],
      [],
      false
    )
  ).toEqual({
    css_bundle: "",
    js_bundle: "",
    pages: [
      {
        model: {
          client_js: 'console.log("Hello world")',
          css: "",
          description: "A test description",
          server_js: {
            get: "return query",
          },
          title: "A test page",
          xml_template: [
            {
              attributes: {},
              children: [],
              props: [],
              tag: "div",
            },
          ],
        },
        url: "/test",
      },
    ],
  });
});

it("Minifies client js for production", () => {
  expect(
    CompileApp(
      [
        {
          path: "/test",
          text: `
<template>
  <div />
</template>
<script area="client">
  function thing() {
    console.log("hello world")
  }
</script>
<title>A test page</title>
<description>A test description</description>`,
        },
      ],
      [],
      true
    )
  ).toEqual({
    css_bundle: "",
    js_bundle: "",
    pages: [
      {
        model: {
          client_js: 'function thing(){console.log("hello world")}',
          css: "",
          description: "A test description",
          server_js: {
            get: "return query",
          },
          title: "A test page",
          xml_template: [
            {
              attributes: {},
              children: [],
              props: [],
              tag: "div",
            },
          ],
        },
        url: "/test",
      },
    ],
  });
});

it("Compiles server get js", () => {
  expect(
    CompileApp(
      [
        {
          path: "/test",
          text: `
<template>
  <div />
</template>
<script area="server">
  console.log("Hello world");
  return {};
</script>
<title>A test page</title>
<description>A test description</description>`,
        },
      ],
      [],
      false
    )
  ).toEqual({
    css_bundle: "",
    js_bundle: "",
    pages: [
      {
        model: {
          client_js: "",
          css: "",
          description: "A test description",
          server_js: {
            get: `console.log("Hello world");
  return {};`,
          },
          title: "A test page",
          xml_template: [
            {
              attributes: {},
              children: [],
              props: [],
              tag: "div",
            },
          ],
        },
        url: "/test",
      },
    ],
  });
});

it("Compiles method js for server", () => {
  expect(
    CompileApp(
      [
        {
          path: "/test",
          text: `
<template>
  <div />
</template>
<script area="server" method="post">
  console.log("Hello world");
  return {};
</script>
<title>A test page</title>
<description>A test description</description>`,
        },
      ],
      [],
      false
    )
  ).toEqual({
    css_bundle: "",
    js_bundle: "",
    pages: [
      {
        model: {
          client_js: "",
          css: "",
          description: "A test description",
          server_js: {
            get: "return query",
            post: `console.log("Hello world");
  return {};`,
          },
          title: "A test page",
          xml_template: [
            {
              attributes: {},
              children: [],
              props: [],
              tag: "div",
            },
          ],
        },
        url: "/test",
      },
    ],
  });
});

it("Compiles page css", () => {
  expect(
    CompileApp(
      [
        {
          path: "/test",
          text: `
<template>
  <div />
</template>
<style>
  .test { display: block; }
</style>
<title>A test page</title>
<description>A test description</description>`,
        },
      ],
      [],
      false
    )
  ).toEqual({
    css_bundle: "",
    js_bundle: "",
    pages: [
      {
        model: {
          client_js: "",
          css:
            '.test[data-specifier="edf762dd4e455c036183858efa983eaf"]{display:block;}',
          description: "A test description",
          server_js: {
            get: "return query",
          },
          title: "A test page",
          xml_template: [
            {
              attributes: {
                "data-specifier": "edf762dd4e455c036183858efa983eaf",
              },
              children: [],
              props: [],
              tag: "div",
            },
          ],
        },
        url: "/test",
      },
    ],
  });
});

it("Bundles component css", () => {
  expect(
    CompileApp(
      [
        {
          path: "/test",
          text: `
<template>
  <test::component>
    <div />
  </test::component>
</template>
<style>
  .test { display: block; }
</style>
<title>A test page</title>
<description>A test description</description>`,
        },
      ],
      [
        {
          path: "/test/component",
          text: `
<template>
  <div>
    <children />
  </div>
</template>
<style>
  div { display: block; }
</style>
        `,
        },
      ],
      false
    )
  ).toEqual({
    css_bundle: `
div[data-specifier="3a003c8ed08e0f1e53bff9cac752c55e"]{display:block;}`,
    js_bundle: "",
    pages: [
      {
        model: {
          client_js: "",
          css:
            '.test[data-specifier="edf762dd4e455c036183858efa983eaf"]{display:block;}',
          description: "A test description",
          server_js: {
            get: "return query",
          },
          title: "A test page",
          xml_template: [
            {
              attributes: {
                "data-specifier": "3a003c8ed08e0f1e53bff9cac752c55e",
              },
              children: [
                {
                  attributes: {
                    "data-specifier": "edf762dd4e455c036183858efa983eaf",
                  },
                  children: [],
                  props: [],
                  tag: "div",
                },
              ],
              props: [{}],
              tag: "div",
            },
          ],
        },
        url: "/test",
      },
    ],
  });
});

it("Bundles component javascript", () => {
  expect(
    CompileApp(
      [
        {
          path: "/test",
          text: `
<template>
  <test::component>
    <div />
  </test::component>
</template>
<style>
  .test { display: block; }
</style>
<title>A test page</title>
<description>A test description</description>`,
        },
      ],
      [
        {
          path: "/test/component",
          text: `
<template>
  <div>
    <children />
  </div>
</template>
<script area="client">
  console.log("Hello world");
</script>
        `,
        },
      ],
      false
    )
  ).toEqual({
    css_bundle: "",
    js_bundle: `
console.log("Hello world");`,
    pages: [
      {
        model: {
          client_js: "",
          css:
            '.test[data-specifier="edf762dd4e455c036183858efa983eaf"]{display:block;}',
          description: "A test description",
          server_js: {
            get: "return query",
          },
          title: "A test page",
          xml_template: [
            {
              attributes: {},
              children: [
                {
                  attributes: {
                    "data-specifier": "edf762dd4e455c036183858efa983eaf",
                  },
                  children: [],
                  props: [],
                  tag: "div",
                },
              ],
              props: [{}],
              tag: "div",
            },
          ],
        },
        url: "/test",
      },
    ],
  });
});

it("Does not bundle css if the component is not always used", () => {
  expect(
    CompileApp(
      [
        {
          path: "/test",
          text: `
<template>
  <test::component>
    <div />
  </test::component>
</template>
<style>
  .test { display: block; }
</style>
<title>A test page</title>
<description>A test description</description>`,
        },
        {
          path: "/test",
          text: `
<template>
  <div />
</template>
<style>
  .test { display: block; }
</style>
<title>A test page</title>
<description>A test description</description>`,
        },
      ],
      [
        {
          path: "/test/component",
          text: `
<template>
  <div>
    <children />
  </div>
</template>
<style>
  div { display: block; }
</style>
        `,
        },
      ],
      false
    )
  ).toEqual({
    css_bundle: "",
    js_bundle: "",
    pages: [
      {
        model: {
          client_js: "",
          css:
            '.test[data-specifier="edf762dd4e455c036183858efa983eaf"]{display:block;}div[data-specifier="3a003c8ed08e0f1e53bff9cac752c55e"]{display:block;}',
          description: "A test description",
          server_js: {
            get: "return query",
          },
          title: "A test page",
          xml_template: [
            {
              attributes: {
                "data-specifier": "3a003c8ed08e0f1e53bff9cac752c55e",
              },
              children: [
                {
                  attributes: {
                    "data-specifier": "edf762dd4e455c036183858efa983eaf",
                  },
                  children: [],
                  props: [],
                  tag: "div",
                },
              ],
              props: [{}],
              tag: "div",
            },
          ],
        },
        url: "/test",
      },
      {
        model: {
          client_js: "",
          css:
            '.test[data-specifier="edf762dd4e455c036183858efa983eaf"]{display:block;}',
          description: "A test description",
          server_js: {
            get: "return query",
          },
          title: "A test page",
          xml_template: [
            {
              attributes: {
                "data-specifier": "edf762dd4e455c036183858efa983eaf",
              },
              children: [],
              props: [],
              tag: "div",
            },
          ],
        },
        url: "/test",
      },
    ],
  });
});

it("Does not bundle component JavaScript in one page", () => {
  expect(
    CompileApp(
      [
        {
          path: "/test",
          text: `
<template>
  <test::component>
    <div />
  </test::component>
</template>
<title>A test page</title>
<description>A test description</description>`,
        },
        {
          path: "/test2",
          text: `
<template>
  <div />
</template>
<title>A test page</title>
<description>A test description</description>`,
        },
      ],
      [
        {
          path: "/test/component",
          text: `
<template>
  <div>
    <children />
  </div>
</template>
<script area="client">
  console.log("Hello world");
</script>
        `,
        },
      ],
      false
    )
  ).toEqual({
    css_bundle: "",
    js_bundle: "",
    pages: [
      {
        model: {
          client_js: 'console.log("Hello world");',
          css: "",
          description: "A test description",
          server_js: {
            get: "return query",
          },
          title: "A test page",
          xml_template: [
            {
              attributes: {},
              children: [
                {
                  attributes: {},
                  children: [],
                  props: [],
                  tag: "div",
                },
              ],
              props: [{}],
              tag: "div",
            },
          ],
        },
        url: "/test",
      },
      {
        model: {
          client_js: ``,
          css: "",
          description: "A test description",
          server_js: {
            get: "return query",
          },
          title: "A test page",
          xml_template: [
            {
              attributes: {},
              children: [],
              props: [],
              tag: "div",
            },
          ],
        },
        url: "/test2",
      },
    ],
  });
});
