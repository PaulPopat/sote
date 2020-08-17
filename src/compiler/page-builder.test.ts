import { CompileApp } from "./page-builder";

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
        url: "/test2",
      },
    ],
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
              tag: "div",
              attributes: {
                "data-specifier": "3a003c8ed08e0f1e53bff9cac752c55e",
              },
              children: [
                {
                  tag: "div",
                  attributes: {
                    "data-specifier": "3a003c8ed08e0f1e53bff9cac752c55e",
                  },
                  children: [
                    {
                      tag: "div",
                      attributes: {
                        "data-specifier": "edf762dd4e455c036183858efa983eaf",
                      },
                      children: [],
                      props: [],
                    },
                  ],
                  props: [{}],
                },
              ],
              props: [{}],
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
              tag: "div",
              attributes: {
                "data-specifier": "3a003c8ed08e0f1e53bff9cac752c55e",
              },
              children: [
                {
                  tag: "div",
                  attributes: {
                    "data-specifier": "3a003c8ed08e0f1e53bff9cac752c55e",
                  },
                  children: [
                    {
                      tag: "div",
                      attributes: {
                        "data-specifier": "edf762dd4e455c036183858efa983eaf",
                      },
                      children: [],
                      props: [],
                    },
                  ],
                  props: [{}],
                },
              ],
              props: [{}],
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

it("Applies is mso", async () => {
  expect(
    await CompileApp(
      [
        {
          path: "/test",
          text: `
<template>
  <std::email::is-mso>
    <div />
  </std::email::is-mso>
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
              children: [
                { tag: "div", attributes: {}, children: [], props: [] },
              ],
              props: [{}],
              tag: "EMAIL_IS_MSO",
            },
          ],
        },
        url: "/test",
      },
    ],
  });
});

it("Applies not mso", async () => {
  expect(
    await CompileApp(
      [
        {
          path: "/test",
          text: `
<template>
  <std::email::not-mso>
    <div />
  </std::email::not-mso>
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
              children: [
                { tag: "div", attributes: {}, children: [], props: [] },
              ],
              props: [{}],
              tag: "EMAIL_NOT_MSO",
            },
          ],
        },
        url: "/test",
      },
    ],
  });
});
