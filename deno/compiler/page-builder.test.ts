import { assertEquals } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { CompileApp } from "./page-builder.ts";

async function* AsGenerator<T>(data: T[]) {
  for (const item of data) {
    yield item;
  }
}

Deno.test("Compiles a basic page", async () => {
  assertEquals(
    await CompileApp(
      AsGenerator([
        {
          path: "/test",
          text: `
<template>
  <div />
</template>
<title>A test page</title>
<description>A test description</description>`,
          local_path: "./",
        },
      ]),
      AsGenerator([])
    ),
    {
      css_bundle: "",
      js_bundle: "",
      pages: [
        {
          model: {
            client_js: "",
            css: "",
            description: "A test description",
            language: undefined,
            used: undefined,
            server_js: {
              get: "return query",
            },
            title: "A test page",
            xml_template: [
              {
                attributes: {},
                children: [],
                tag: "div",
              },
            ],
          },
          url: "/test",
        },
      ],
      components: {
        "std:email:is-mso": {
          xml_template: [
            {
              attributes: {},
              children: [
                {
                  attributes: {},
                  children: [],
                  tag: "children",
                },
              ],
              tag: "EMAIL_IS_MSO",
            },
          ],
          client_js: undefined,
          css: undefined,
          language: undefined,
          server_js: undefined,
          title: undefined,
        },
        "std:email:not-mso": {
          xml_template: [
            {
              attributes: {},
              children: [
                {
                  attributes: {},
                  children: [],
                  tag: "children",
                },
              ],
              tag: "EMAIL_NOT_MSO",
            },
          ],
          client_js: undefined,
          css: undefined,
          language: undefined,
          server_js: undefined,
          title: undefined,
        },
      },
    }
  );
});

Deno.test("Compiles a basic page with language", async () => {
  assertEquals(
    await CompileApp(
      AsGenerator([
        {
          path: "/test",
          text: `
<template>
  <div />
</template>
<title>A test page</title>
<description>A test description</description>
<lang>A test language</lang>`,
          local_path: "./",
        },
      ]),
      AsGenerator([])
    ),
    {
      css_bundle: "",
      js_bundle: "",
      pages: [
        {
          model: {
            client_js: "",
            css: "",
            description: "A test description",
            language: "A test language",
            used: undefined,
            server_js: {
              get: "return query",
            },
            title: "A test page",
            xml_template: [
              {
                attributes: {},
                children: [],
                tag: "div",
              },
            ],
          },
          url: "/test",
        },
      ],
      components: {
        "std:email:is-mso": {
          xml_template: [
            {
              attributes: {},
              children: [
                {
                  attributes: {},
                  children: [],
                  tag: "children",
                },
              ],
              tag: "EMAIL_IS_MSO",
            },
          ],
          client_js: undefined,
          css: undefined,
          language: undefined,
          server_js: undefined,
          title: undefined,
        },
        "std:email:not-mso": {
          xml_template: [
            {
              attributes: {},
              children: [
                {
                  attributes: {},
                  children: [],
                  tag: "children",
                },
              ],
              tag: "EMAIL_NOT_MSO",
            },
          ],
          client_js: undefined,
          css: undefined,
          language: undefined,
          server_js: undefined,
          title: undefined,
        },
      },
    }
  );
});

Deno.test("Compiles client javascript", async () => {
  assertEquals(
    await CompileApp(
      AsGenerator([
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
          local_path: "./",
        },
      ]),
      AsGenerator([])
    ),
    {
      css_bundle: "",
      js_bundle: "",
      pages: [
        {
          model: {
            client_js: 'console.log("Hello world")',
            css: "",
            description: "A test description",
            language: undefined,
            used: undefined,
            server_js: {
              get: "return query",
            },
            title: "A test page",
            xml_template: [
              {
                attributes: {},
                children: [],
                tag: "div",
              },
            ],
          },
          url: "/test",
        },
      ],
      components: {
        "std:email:is-mso": {
          xml_template: [
            {
              attributes: {},
              children: [
                {
                  attributes: {},
                  children: [],
                  tag: "children",
                },
              ],
              tag: "EMAIL_IS_MSO",
            },
          ],
          client_js: undefined,
          css: undefined,
          language: undefined,
          server_js: undefined,
          title: undefined,
        },
        "std:email:not-mso": {
          xml_template: [
            {
              attributes: {},
              children: [
                {
                  attributes: {},
                  children: [],
                  tag: "children",
                },
              ],
              tag: "EMAIL_NOT_MSO",
            },
          ],
          client_js: undefined,
          css: undefined,
          language: undefined,
          server_js: undefined,
          title: undefined,
        },
      },
    }
  );
});

Deno.test("Compiles server get js", async () => {
  assertEquals(
    await CompileApp(
      AsGenerator([
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
          local_path: "./",
        },
      ]),
      AsGenerator([])
    ),
    {
      css_bundle: "",
      js_bundle: "",
      pages: [
        {
          model: {
            client_js: "",
            css: "",
            description: "A test description",
            language: undefined,
            used: undefined,
            server_js: {
              get: `console.log("Hello world");
  return {};`,
            },
            title: "A test page",
            xml_template: [
              {
                attributes: {},
                children: [],
                tag: "div",
              },
            ],
          },
          url: "/test",
        },
      ],
      components: {
        "std:email:is-mso": {
          xml_template: [
            {
              attributes: {},
              children: [
                {
                  attributes: {},
                  children: [],
                  tag: "children",
                },
              ],
              tag: "EMAIL_IS_MSO",
            },
          ],
          client_js: undefined,
          css: undefined,
          language: undefined,
          server_js: undefined,
          title: undefined,
        },
        "std:email:not-mso": {
          xml_template: [
            {
              attributes: {},
              children: [
                {
                  attributes: {},
                  children: [],
                  tag: "children",
                },
              ],
              tag: "EMAIL_NOT_MSO",
            },
          ],
          client_js: undefined,
          css: undefined,
          language: undefined,
          server_js: undefined,
          title: undefined,
        },
      },
    }
  );
});

Deno.test("Compiles method js for server", async () => {
  assertEquals(
    await CompileApp(
      AsGenerator([
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
          local_path: "./",
        },
      ]),
      AsGenerator([])
    ),
    {
      css_bundle: "",
      js_bundle: "",
      pages: [
        {
          model: {
            client_js: "",
            css: "",
            description: "A test description",
            language: undefined,
            used: undefined,
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
                tag: "div",
              },
            ],
          },
          url: "/test",
        },
      ],
      components: {
        "std:email:is-mso": {
          xml_template: [
            {
              attributes: {},
              children: [
                {
                  attributes: {},
                  children: [],
                  tag: "children",
                },
              ],
              tag: "EMAIL_IS_MSO",
            },
          ],
          client_js: undefined,
          css: undefined,
          language: undefined,
          server_js: undefined,
          title: undefined,
        },
        "std:email:not-mso": {
          xml_template: [
            {
              attributes: {},
              children: [
                {
                  attributes: {},
                  children: [],
                  tag: "children",
                },
              ],
              tag: "EMAIL_NOT_MSO",
            },
          ],
          client_js: undefined,
          css: undefined,
          language: undefined,
          server_js: undefined,
          title: undefined,
        },
      },
    }
  );
});

Deno.test("Compiles page css", async () => {
  assertEquals(
    await CompileApp(
      AsGenerator([
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
          local_path: "./",
        },
      ]),
      AsGenerator([])
    ),
    {
      css_bundle: "",
      js_bundle: "",
      pages: [
        {
          model: {
            client_js: "",
            css:
              '.test[data-specifier="edf762dd4e455c036183858efa983eaf"]{display:block;}',
            description: "A test description",
            language: undefined,
            used: undefined,
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
                tag: "div",
              },
            ],
          },
          url: "/test",
        },
      ],
      components: {
        "std:email:is-mso": {
          xml_template: [
            {
              attributes: {},
              children: [
                {
                  attributes: {},
                  children: [],
                  tag: "children",
                },
              ],
              tag: "EMAIL_IS_MSO",
            },
          ],
          client_js: undefined,
          css: undefined,
          language: undefined,
          server_js: undefined,
          title: undefined,
        },
        "std:email:not-mso": {
          xml_template: [
            {
              attributes: {},
              children: [
                {
                  attributes: {},
                  children: [],
                  tag: "children",
                },
              ],
              tag: "EMAIL_NOT_MSO",
            },
          ],
          client_js: undefined,
          css: undefined,
          language: undefined,
          server_js: undefined,
          title: undefined,
        },
      },
    }
  );
});

Deno.test("Bundles component css", async () => {
  assertEquals(
    await CompileApp(
      AsGenerator([
        {
          path: "/test",
          text: `
<template>
  <test:component>
    <div />
  </test:component>
</template>
<style>
  .test { display: block; }
</style>
<title>A test page</title>
<description>A test description</description>`,
          local_path: "./",
        },
        {
          path: "/test2",
          text: `
<template>
  <test:component>
    <div />
  </test:component>
</template>
<style>
  .test { display: block; }
</style>
<title>A test page</title>
<description>A test description</description>`,
          local_path: "./",
        },
      ]),
      AsGenerator([
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
          local_path: "./",
        },
      ])
    ),
    {
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
            language: undefined,
            used: undefined,
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
                    tag: "div",
                  },
                ],
                tag: "test:component",
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
            language: undefined,
            used: undefined,
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
                    tag: "div",
                  },
                ],
                tag: "test:component",
              },
            ],
          },
          url: "/test2",
        },
      ],
      components: {
        "std:email:is-mso": {
          xml_template: [
            {
              attributes: {},
              children: [
                {
                  attributes: {},
                  children: [],
                  tag: "children",
                },
              ],
              tag: "EMAIL_IS_MSO",
            },
          ],
          client_js: undefined,
          css: undefined,
          language: undefined,
          server_js: undefined,
          title: undefined,
        },
        "std:email:not-mso": {
          xml_template: [
            {
              attributes: {},
              children: [
                {
                  attributes: {},
                  children: [],
                  tag: "children",
                },
              ],
              tag: "EMAIL_NOT_MSO",
            },
          ],
          client_js: undefined,
          css: undefined,
          language: undefined,
          server_js: undefined,
          title: undefined,
        },
        "test:component": {
          xml_template: [
            {
              attributes: {
                "data-specifier": "3a003c8ed08e0f1e53bff9cac752c55e",
              },
              children: [
                {
                  attributes: {},
                  children: [],
                  tag: "children",
                },
              ],
              tag: "div",
            },
          ],
          css:
            'div[data-specifier="3a003c8ed08e0f1e53bff9cac752c55e"]{display:block;}',
          server_js: {},
          client_js: undefined,
          description: undefined,
          language: undefined,
          title: undefined,
        },
      },
    }
  );
});

Deno.test("Bundles component css from multiple components", async () => {
  assertEquals(
    await CompileApp(
      AsGenerator([
        {
          path: "/test",
          text: `
<template>
  <test:component>
    <test:other>
      <div />
    </test:other>
  </test:component>
</template>
<style>
  .test { display: block; }
</style>
<title>A test page</title>
<description>A test description</description>`,
          local_path: "./",
        },
        {
          path: "/test2",
          text: `
<template>
  <test:component>
    <test:other>
      <div />
    </test:other>
  </test:component>
</template>
<style>
  .test { display: block; }
</style>
<title>A test page</title>
<description>A test description</description>`,
          local_path: "./",
        },
      ]),
      AsGenerator([
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
          local_path: "./",
        },
        {
          path: "/test/other",
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
          local_path: "./",
        },
      ])
    ),
    {
      pages: [
        {
          url: "/test",
          model: {
            xml_template: [
              {
                tag: "test:component",
                attributes: {},
                children: [
                  {
                    tag: "test:other",
                    attributes: {},
                    children: [
                      {
                        tag: "div",
                        attributes: {
                          "data-specifier": "edf762dd4e455c036183858efa983eaf",
                        },
                        children: [],
                      },
                    ],
                  },
                ],
              },
            ],
            language: undefined,
            used: undefined,
            server_js: {
              get: "return query",
            },
            client_js: "",
            css:
              '.test[data-specifier="edf762dd4e455c036183858efa983eaf"]{display:block;}',
            title: "A test page",
            description: "A test description",
          },
        },
        {
          url: "/test2",
          model: {
            xml_template: [
              {
                tag: "test:component",
                attributes: {},
                children: [
                  {
                    tag: "test:other",
                    attributes: {},
                    children: [
                      {
                        tag: "div",
                        attributes: {
                          "data-specifier": "edf762dd4e455c036183858efa983eaf",
                        },
                        children: [],
                      },
                    ],
                  },
                ],
              },
            ],
            language: undefined,
            used: undefined,
            server_js: {
              get: "return query",
            },
            client_js: "",
            css:
              '.test[data-specifier="edf762dd4e455c036183858efa983eaf"]{display:block;}',
            title: "A test page",
            description: "A test description",
          },
        },
      ],
      components: {
        "std:email:is-mso": {
          xml_template: [
            {
              attributes: {},
              children: [
                {
                  attributes: {},
                  children: [],
                  tag: "children",
                },
              ],
              tag: "EMAIL_IS_MSO",
            },
          ],
          client_js: undefined,
          css: undefined,
          language: undefined,
          server_js: undefined,
          title: undefined,
        },
        "std:email:not-mso": {
          xml_template: [
            {
              attributes: {},
              children: [
                {
                  attributes: {},
                  children: [],
                  tag: "children",
                },
              ],
              tag: "EMAIL_NOT_MSO",
            },
          ],
          client_js: undefined,
          css: undefined,
          language: undefined,
          server_js: undefined,
          title: undefined,
        },
        "test:component": {
          xml_template: [
            {
              attributes: {
                "data-specifier": "3a003c8ed08e0f1e53bff9cac752c55e",
              },
              children: [
                {
                  attributes: {},
                  children: [],
                  tag: "children",
                },
              ],
              tag: "div",
            },
          ],
          css:
            'div[data-specifier="3a003c8ed08e0f1e53bff9cac752c55e"]{display:block;}',
          server_js: {},
          client_js: undefined,
          description: undefined,
          language: undefined,
          title: undefined,
        },
        "test:other": {
          xml_template: [
            {
              attributes: {
                "data-specifier": "3a003c8ed08e0f1e53bff9cac752c55e",
              },
              children: [
                {
                  attributes: {},
                  children: [],
                  tag: "children",
                },
              ],
              tag: "div",
            },
          ],
          css:
            'div[data-specifier="3a003c8ed08e0f1e53bff9cac752c55e"]{display:block;}',
          server_js: {},
          client_js: undefined,
          description: undefined,
          language: undefined,
          title: undefined,
        },
      },
      css_bundle:
        '\ndiv[data-specifier="3a003c8ed08e0f1e53bff9cac752c55e"]{display:block;}\ndiv[data-specifier="3a003c8ed08e0f1e53bff9cac752c55e"]{display:block;}',
      js_bundle: "",
    }
  );
});

Deno.test("Bundles component javascript", async () => {
  assertEquals(
    await CompileApp(
      AsGenerator([
        {
          path: "/test",
          text: `
<template>
  <test:component>
    <div />
  </test:component>
</template>
<style>
  .test { display: block; }
</style>
<title>A test page</title>
<description>A test description</description>`,
          local_path: "./",
        },
      ]),
      AsGenerator([
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
          local_path: "./",
        },
      ])
    ),
    {
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
            language: undefined,
            used: undefined,
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
                    tag: "div",
                  },
                ],
                tag: "test:component",
              },
            ],
          },
          url: "/test",
        },
      ],
      components: {
        "std:email:is-mso": {
          xml_template: [
            {
              attributes: {},
              children: [
                {
                  attributes: {},
                  children: [],
                  tag: "children",
                },
              ],
              tag: "EMAIL_IS_MSO",
            },
          ],
          client_js: undefined,
          css: undefined,
          language: undefined,
          server_js: undefined,
          title: undefined,
        },
        "std:email:not-mso": {
          xml_template: [
            {
              attributes: {},
              children: [
                {
                  attributes: {},
                  children: [],
                  tag: "children",
                },
              ],
              tag: "EMAIL_NOT_MSO",
            },
          ],
          client_js: undefined,
          css: undefined,
          language: undefined,
          server_js: undefined,
          title: undefined,
        },
        "test:component": {
          xml_template: [
            {
              attributes: {},
              children: [
                {
                  attributes: {},
                  children: [],
                  tag: "children",
                },
              ],
              tag: "div",
            },
          ],
          client_js: 'console.log("Hello world");',
          server_js: {},
          css: undefined,
          language: undefined,
          title: undefined,
          description: undefined,
        },
      },
    }
  );
});

Deno.test(
  "Does not bundle css if the component is not always used",
  async () => {
    assertEquals(
      await CompileApp(
        AsGenerator([
          {
            path: "/test",
            text: `
<template>
  <test:component>
    <div />
  </test:component>
</template>
<style>
  .test { display: block; }
</style>
<title>A test page</title>
<description>A test description</description>`,
            local_path: "./",
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
            local_path: "./",
          },
        ]),
        AsGenerator([
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
            local_path: "./",
          },
        ])
      ),
      {
        css_bundle: "",
        js_bundle: "",
        pages: [
          {
            model: {
              client_js: "",
              css:
                '.test[data-specifier="edf762dd4e455c036183858efa983eaf"]{display:block;}div[data-specifier="3a003c8ed08e0f1e53bff9cac752c55e"]{display:block;}',
              description: "A test description",
              language: undefined,
              used: undefined,
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
                      tag: "div",
                    },
                  ],
                  tag: "test:component",
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
              language: undefined,
              used: undefined,
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
                  tag: "div",
                },
              ],
            },
            url: "/test",
          },
        ],
        components: {
          "std:email:is-mso": {
            xml_template: [
              {
                attributes: {},
                children: [
                  {
                    attributes: {},
                    children: [],
                    tag: "children",
                  },
                ],
                tag: "EMAIL_IS_MSO",
              },
            ],
            client_js: undefined,
            css: undefined,
            language: undefined,
            server_js: undefined,
            title: undefined,
          },
          "std:email:not-mso": {
            xml_template: [
              {
                attributes: {},
                children: [
                  {
                    attributes: {},
                    children: [],
                    tag: "children",
                  },
                ],
                tag: "EMAIL_NOT_MSO",
              },
            ],
            client_js: undefined,
            css: undefined,
            language: undefined,
            server_js: undefined,
            title: undefined,
          },
          "test:component": {
            xml_template: [
              {
                attributes: {
                  "data-specifier": "3a003c8ed08e0f1e53bff9cac752c55e",
                },
                children: [
                  {
                    attributes: {},
                    children: [],
                    tag: "children",
                  },
                ],
                tag: "div",
              },
            ],
            client_js: undefined,
            language: undefined,
            title: undefined,
            description: undefined,
            css:
              'div[data-specifier="3a003c8ed08e0f1e53bff9cac752c55e"]{display:block;}',
            server_js: {},
          },
        },
      }
    );
  }
);

Deno.test("Does not bundle component JavaScript in one page", async () => {
  assertEquals(
    await CompileApp(
      AsGenerator([
        {
          path: "/test",
          text: `
<template>
  <test:component>
    <div />
  </test:component>
</template>
<title>A test page</title>
<description>A test description</description>`,
          local_path: "./",
        },
        {
          path: "/test2",
          text: `
<template>
  <div />
</template>
<title>A test page</title>
<description>A test description</description>`,
          local_path: "./",
        },
      ]),
      AsGenerator([
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
          local_path: "./",
        },
      ])
    ),
    {
      css_bundle: "",
      js_bundle: "",
      pages: [
        {
          model: {
            client_js: 'console.log("Hello world");',
            css: "",
            description: "A test description",
            language: undefined,
            used: undefined,
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
                    tag: "div",
                  },
                ],
                tag: "test:component",
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
            language: undefined,
            used: undefined,
            server_js: {
              get: "return query",
            },
            title: "A test page",
            xml_template: [
              {
                attributes: {},
                children: [],
                tag: "div",
              },
            ],
          },
          url: "/test2",
        },
      ],
      components: {
        "std:email:is-mso": {
          xml_template: [
            {
              attributes: {},
              children: [
                {
                  attributes: {},
                  children: [],
                  tag: "children",
                },
              ],
              tag: "EMAIL_IS_MSO",
            },
          ],
          client_js: undefined,
          css: undefined,
          language: undefined,
          server_js: undefined,
          title: undefined,
        },
        "std:email:not-mso": {
          xml_template: [
            {
              attributes: {},
              children: [
                {
                  attributes: {},
                  children: [],
                  tag: "children",
                },
              ],
              tag: "EMAIL_NOT_MSO",
            },
          ],
          client_js: undefined,
          css: undefined,
          language: undefined,
          server_js: undefined,
          title: undefined,
        },
        "test:component": {
          xml_template: [
            {
              attributes: {},
              children: [
                {
                  attributes: {},
                  children: [],
                  tag: "children",
                },
              ],
              tag: "div",
            },
          ],
          css: undefined,
          language: undefined,
          title: undefined,
          description: undefined,
          client_js: 'console.log("Hello world");',
          server_js: {},
        },
      },
    }
  );
});
