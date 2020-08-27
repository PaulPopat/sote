import { CompileApp } from "./page-builder";

jest.mock("uuid", () => {
  let index = 0;
  return {
    v4: () => (++index).toString(),
  };
});

it("Compiles a basic page", async () => {
  expect(
    await CompileApp(
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
              tag: "div",
            },
          ],
        },
        url: "/test",
      },
    ],
    components: {
      "std::email::is-mso": {
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
      },
      "std::email::not-mso": {
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
      },
    },
  });
});

it("Compiles client javascript", async () => {
  expect(
    await CompileApp(
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
              tag: "div",
            },
          ],
        },
        url: "/test",
      },
    ],
    components: {
      "std::email::is-mso": {
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
      },
      "std::email::not-mso": {
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
      },
    },
  });
});

it("Minifies client js for production", async () => {
  expect(
    await CompileApp(
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
              tag: "div",
            },
          ],
        },
        url: "/test",
      },
    ],
    components: {
      "std::email::is-mso": {
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
      },
      "std::email::not-mso": {
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
      },
    },
  });
});

it("Compiles server get js", async () => {
  expect(
    await CompileApp(
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
              tag: "div",
            },
          ],
        },
        url: "/test",
      },
    ],
    components: {
      "std::email::is-mso": {
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
      },
      "std::email::not-mso": {
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
      },
    },
  });
});

it("Compiles method js for server", async () => {
  expect(
    await CompileApp(
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
              tag: "div",
            },
          ],
        },
        url: "/test",
      },
    ],
    components: {
      "std::email::is-mso": {
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
      },
      "std::email::not-mso": {
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
      },
    },
  });
});

it("Compiles page css", async () => {
  expect(
    await CompileApp(
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
              tag: "div",
            },
          ],
        },
        url: "/test",
      },
    ],
    components: {
      "std::email::is-mso": {
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
      },
      "std::email::not-mso": {
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
      },
    },
  });
});

it("Prefixes page css", async () => {
  expect(
    await CompileApp(
      [
        {
          path: "/test",
          text: `
<template>
  <div />
</template>
<style>
  ::placeholder {
    color: gray;
  }

  .image {
    background-image: url(image@1x.png);
  }
  @media (min-resolution: 2dppx) {
    .image {
      background-image: url(image@2x.png);
    }
  }
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
            '::-moz-placeholder[data-specifier="ace1752455873d4453d4df844ff0dcf7"]{color:gray;}:-ms-input-placeholder[data-specifier="ace1752455873d4453d4df844ff0dcf7"]{color:gray;}::-ms-input-placeholder[data-specifier="ace1752455873d4453d4df844ff0dcf7"]{color:gray;}::placeholder[data-specifier="ace1752455873d4453d4df844ff0dcf7"]{color:gray;}.image[data-specifier="ace1752455873d4453d4df844ff0dcf7"]{background-image:url(image@1x.png);}@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 2dppx){.image[data-specifier="ace1752455873d4453d4df844ff0dcf7"]{background-image:url(image@2x.png);}}',
          description: "A test description",
          server_js: {
            get: "return query",
          },
          title: "A test page",
          xml_template: [
            {
              attributes: {
                "data-specifier": "ace1752455873d4453d4df844ff0dcf7",
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
      "std::email::is-mso": {
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
      },
      "std::email::not-mso": {
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
      },
    },
  });
});

it("Bundles component css", async () => {
  expect(
    await CompileApp(
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
          path: "/test2",
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
              tag: "test::component",
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
              tag: "test::component",
            },
          ],
        },
        url: "/test2",
      },
    ],
    components: {
      "std::email::is-mso": {
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
      },
      "std::email::not-mso": {
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
      },
      "test::component": {
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
      },
    },
  });
});

it("Bundles component css from multiple components", async () => {
  expect(
    await CompileApp(
      [
        {
          path: "/test",
          text: `
<template>
  <test::component>
    <test::other>
      <div />
    </test::other>
  </test::component>
</template>
<style>
  .test { display: block; }
</style>
<title>A test page</title>
<description>A test description</description>`,
        },
        {
          path: "/test2",
          text: `
<template>
  <test::component>
    <test::other>
      <div />
    </test::other>
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
        },
      ],
      false
    )
  ).toEqual({
    pages: [
      {
        url: "/test",
        model: {
          xml_template: [
            {
              tag: "test::component",
              attributes: {},
              children: [
                {
                  tag: "test::other",
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
              tag: "test::component",
              attributes: {},
              children: [
                {
                  tag: "test::other",
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
      "std::email::is-mso": {
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
      },
      "std::email::not-mso": {
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
      },
      "test::component": {
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
      },
      "test::other": {
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
      },
    },
    css_bundle:
      '\ndiv[data-specifier="3a003c8ed08e0f1e53bff9cac752c55e"]{display:block;}\ndiv[data-specifier="3a003c8ed08e0f1e53bff9cac752c55e"]{display:block;}',
    js_bundle: "",
  });
});

it("Bundles component javascript", async () => {
  expect(
    await CompileApp(
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
                  tag: "div",
                },
              ],
              tag: "test::component",
            },
          ],
        },
        url: "/test",
      },
    ],
    components: {
      "std::email::is-mso": {
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
      },
      "std::email::not-mso": {
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
      },
      "test::component": {
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
      },
    },
  });
});

it("Does not bundle css if the component is not always used", async () => {
  expect(
    await CompileApp(
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
              tag: "test::component",
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
              tag: "div",
            },
          ],
        },
        url: "/test",
      },
    ],
    components: {
      "std::email::is-mso": {
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
      },
      "std::email::not-mso": {
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
      },
      "test::component": {
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
      },
    },
  });
});

it("Does not bundle component JavaScript in one page", async () => {
  expect(
    await CompileApp(
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
                  tag: "div",
                },
              ],
              tag: "test::component",
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
              tag: "div",
            },
          ],
        },
        url: "/test2",
      },
    ],
    components: {
      "std::email::is-mso": {
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
      },
      "std::email::not-mso": {
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
      },
      "test::component": {
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
      },
    },
  });
});
