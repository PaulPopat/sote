import { ParseXml, ToXml } from "./xml-parser.ts";
import { assertEquals } from "https://deno.land/std@0.86.0/testing/asserts.ts";

Deno.test("Parses a simple tag", () => {
  assertEquals(ParseXml("<div/>"), [
    {
      tag: "div",
      attributes: {},
      children: [],
    },
  ]);
});

Deno.test("Parses attributes", () => {
  assertEquals(ParseXml("<div class='test'/>"), [
    {
      tag: "div",
      attributes: { class: "test" },
      children: [],
    },
  ]);
});

Deno.test("Parses text", () => {
  assertEquals(ParseXml("<div>test text</div>"), [
    {
      tag: "div",
      attributes: {},
      children: [{ text: "test text" }],
    },
  ]);
});

Deno.test("Converts all whitespace into spaces", () => {
  assertEquals(
    ParseXml(`<div>test
text</div>`),
    [
      {
        tag: "div",
        attributes: {},
        children: [{ text: "test text" }],
      },
    ]
  );
});

Deno.test("Strips out repeated whitespace", () => {
  assertEquals(ParseXml(`<div>test   text</div>`), [
    {
      tag: "div",
      attributes: {},
      children: [{ text: "test text" }],
    },
  ]);
});

Deno.test("Preserves whitespace in expressions", () => {
  assertEquals(
    ParseXml(`<div>{test
 text}</div>`),
    [
      {
        tag: "div",
        attributes: {},
        children: [
          {
            text: `{test
 text}`,
          },
        ],
      },
    ]
  );
});

Deno.test("Parses special characters in style tags", () => {
  assertEquals(ParseXml('<style><></>""=</style>'), [
    {
      tag: "style",
      attributes: {},
      children: [
        {
          text: '<></>""=',
        },
      ],
    },
  ]);
});

Deno.test("Parses special characters in script tags", () => {
  assertEquals(ParseXml('<script><></>""=</script>'), [
    {
      tag: "script",
      attributes: {},
      children: [
        {
          text: '<></>""=',
        },
      ],
    },
  ]);
});

Deno.test("Parses child elements", () => {
  assertEquals(ParseXml("<div><span>test text</span></div>"), [
    {
      tag: "div",
      attributes: {},
      children: [
        { tag: "span", attributes: {}, children: [{ text: "test text" }] },
      ],
    },
  ]);
});

Deno.test("Parses attributes on child elements", () => {
  assertEquals(ParseXml('<div><span test="other" /></div>'), [
    {
      tag: "div",
      attributes: {},
      children: [{ tag: "span", attributes: { test: "other" }, children: [] }],
    },
  ]);
});

Deno.test("Parses attributes with no value as empty string", () => {
  assertEquals(ParseXml("<div><span test /></div>"), [
    {
      tag: "div",
      attributes: {},
      children: [{ tag: "span", attributes: { test: "" }, children: [] }],
    },
  ]);
});

Deno.test("Parses child text and elements", () => {
  assertEquals(ParseXml("<div>test test <span>test text</span></div>"), [
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

Deno.test("Parses child elements with text on either side", () => {
  assertEquals(
    ParseXml("<div>test test <span>test text</span> test test</div>"),
    [
      {
        tag: "div",
        attributes: {},
        children: [
          { text: "test test" },
          { tag: "span", attributes: {}, children: [{ text: "test text" }] },
          { text: "test test" },
        ],
      },
    ]
  );
});

Deno.test("Parses multiple root elements", () => {
  assertEquals(ParseXml("<div/><span/>"), [
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

Deno.test(
  "Parses multiple root elements with children and the same tag",
  () => {
    assertEquals(ParseXml("<div>test1</div><div>test2</div>"), [
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
  }
);

Deno.test(
  "Parses multiple child elements with children and the same tag",
  () => {
    assertEquals(
      ParseXml("<div><script>test1</script><div>test2</div></div>"),
      [
        {
          tag: "div",
          attributes: {},
          children: [
            {
              tag: "script",
              attributes: {},
              children: [{ text: "test1" }],
            },
            {
              tag: "div",
              attributes: {},
              children: [{ text: "test2" }],
            },
          ],
        },
      ]
    );
  }
);

Deno.test(
  "Parses multiple root elements with children and the same tag with attributes",
  () => {
    assertEquals(
      ParseXml("<div class='test1'>test1</div><div class='test2'>test2</div>"),
      [
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
      ]
    );
  }
);

Deno.test("Parses complex expressions in attributes", () => {
  assertEquals(
    ParseXml(
      "<div class=\":props.at === page.url ? 'active' : ''\">test1</div>"
    ),
    [
      {
        tag: "div",
        attributes: { class: ":props.at === page.url ? 'active' : ''" },
        children: [{ text: "test1" }],
      },
    ]
  );
});

Deno.test("Ignores HTML in an expression", () => {
  assertEquals(ParseXml("<div>{<div></div>}</div>"), [
    {
      tag: "div",
      attributes: {},
      children: [{ text: "{<div></div>}" }],
    },
  ]);
});

Deno.test("Ignores comments", () => {
  assertEquals(ParseXml("<div>test test <!-- test text --> test test</div>"), [
    {
      tag: "div",
      attributes: {},
      children: [{ text: "test test test test" }],
    },
  ]);
});

Deno.test("Ignores comments containing xml", () => {
  assertEquals(
    ParseXml(
      `"<title>{await context.UIText.get(\"homepage_title\")} - {await context.UIText.get(\"publications_title\")}</title>\r\n<description>\r\n  {await context.UIText.get(\"publications_description\")}\r\n</description>\r\n<template>\r\n  <app::layout location=\"/cv\">\r\n    <layout::container>\r\n      <img src=\"/_/img/texture-catscradel.jpeg\" alt=\"\" />\r\n      <for subject=\":await context.UIText.get('publications_items')\" key=\"reference\">\r\n        <!-- <p class=\"article\">\r\n          <if check=\":reference.type === 'book' && reference.edited\">\r\n            <if check=\":reference.authors\">\r\n              <app::authors authors=\":reference.authors\" />\r\n            </if>\r\n          </if>\r\n          <if check=\":reference.type === 'book' && !reference.edited\"></if>\r\n        </p> -->\r\n      </for>\r\n    </layout::container>\r\n  </app::layout>\r\n</template>\r\n<style>\r\n  h2 {\r\n    display: flex;\r\n    justify-content: space-between;\r\n  }\r\n\r\n  h2 small {\r\n    font-weight: 400;\r\n    font-size: 1rem;\r\n  }\r\n\r\n  img {\r\n    display: block;\r\n    margin: 0 auto;\r\n    width: 288px;\r\n  }\r\n</style>\r\n"`
    ),
    [
      {
        text: '"',
      },
      {
        attributes: {},
        children: [
          {
            text:
              '{await context.UIText.get("homepage_title")} - {await context.UIText.get("publications_title")}',
          },
        ],
        tag: "title",
      },
      {
        attributes: {},
        children: [
          {
            text: '{await context.UIText.get("publications_description")}',
          },
        ],
        tag: "description",
      },
      {
        attributes: {},
        children: [
          {
            attributes: {
              location: "/cv",
            },
            children: [
              {
                attributes: {},
                children: [
                  {
                    attributes: {
                      alt: "",
                      src: "/_/img/texture-catscradel.jpeg",
                    },
                    children: [],
                    tag: "img",
                  },
                  {
                    attributes: {
                      key: "reference",
                      subject:
                        ":await context.UIText.get('publications_items')",
                    },
                    children: [],
                    tag: "for",
                  },
                ],
                tag: "layout::container",
              },
            ],
            tag: "app::layout",
          },
        ],
        tag: "template",
      },
      {
        attributes: {},
        children: [
          {
            text:
              "h2 {\r\n    display: flex;\r\n    justify-content: space-between;\r\n  }\r\n\r\n  h2 small {\r\n    font-weight: 400;\r\n    font-size: 1rem;\r\n  }\r\n\r\n  img {\r\n    display: block;\r\n    margin: 0 auto;\r\n    width: 288px;\r\n  }",
          },
        ],
        tag: "style",
      },
    ]
  );
});

Deno.test("Ignores multiline comments", () => {
  assertEquals(
    ParseXml(`<div>test test <!-- test
      
      
      text --> test test</div>`),
    [
      {
        tag: "div",
        attributes: {},
        children: [{ text: "test test test test" }],
      },
    ]
  );
});

Deno.test("Parses complex items in a for loop", () => {
  assertEquals(
    ParseXml(`<template>
  <span class="authors">
    <for subject=":props.authors.map((a, i) => ({ index: i, item: a }))" key="author">
      {author.item.surname}, {author.item.initial}
    </for>
  </span>
</template>`),
    [
      {
        tag: "template",
        attributes: {},
        children: [
          {
            tag: "span",
            attributes: { class: "authors" },
            children: [
              {
                tag: "for",
                attributes: {
                  subject:
                    ":props.authors.map((a, i) => ({ index: i, item: a }))",
                  key: "author",
                },
                children: [
                  {
                    text: "{author.item.surname}, {author.item.initial}",
                  },
                ],
              },
            ],
          },
        ],
      },
    ]
  );
});

Deno.test("Writes an xml tag", () => {
  assertEquals(
    ToXml([{ tag: "div", attributes: {}, children: [] }]),
    "<div></div>"
  );
});

Deno.test("Writes a self closing xml tag", () => {
  assertEquals(ToXml([{ tag: "br", attributes: {}, children: [] }]), "<br/>");
});

Deno.test("Writes multiple root xml tags", () => {
  assertEquals(
    ToXml([
      { tag: "div", attributes: {}, children: [] },
      { tag: "span", attributes: {}, children: [] },
    ]),
    "<div></div><span></span>"
  );
});

Deno.test("Write xml text", () => {
  assertEquals(ToXml([{ text: "Hello world" }]), "Hello world");
});

Deno.test("Writes xml attributes", () => {
  assertEquals(
    ToXml([{ tag: "div", attributes: { class: "test" }, children: [] }]),
    '<div class="test"></div>'
  );
});

Deno.test("Escapes xml attributes", () => {
  assertEquals(
    ToXml([{ tag: "div", attributes: { class: 'te"<>/st' }, children: [] }]),
    '<div class="te&quot;<>/st"></div>'
  );
});

Deno.test("Writes xml child text", () => {
  assertEquals(
    ToXml([{ tag: "div", attributes: {}, children: [{ text: "test" }] }]),
    "<div>test</div>"
  );
});

Deno.test("Escapes xml child text", () => {
  assertEquals(
    ToXml([{ tag: "div", attributes: {}, children: [{ text: 'te"<>/st' }] }]),
    "<div>te&quot;&lt;&gt;/st</div>"
  );
});

Deno.test("Does not escape raw HTML", () => {
  assertEquals(
    ToXml([
      {
        tag: "div",
        attributes: {},
        children: [{ text: '___HTML_START_RAW___te"<>/st___HTML_END_RAW___' }],
      },
    ]),
    '<div>te"<>/st</div>'
  );
});

Deno.test("Does not escape raw HTML but escapes none raw in the same text string", () => {
  assertEquals(
    ToXml([
      {
        tag: "div",
        attributes: {},
        children: [
          {
            text:
              'te"<>/st___HTML_START_RAW___te"<>/st___HTML_END_RAW___te"<>/st',
          },
        ],
      },
    ]),
    '<div>te&quot;&lt;&gt;/stte"<>/stte&quot;&lt;&gt;/st</div>'
  );
});

Deno.test("Allows the & symbol", () => {
  assertEquals(
    ToXml([{ tag: "div", attributes: {}, children: [{ text: "te&nbsp;st" }] }]),
    "<div>te&nbsp;st</div>"
  );
});

Deno.test("Writes xml child elements", () => {
  assertEquals(
    ToXml([
      {
        tag: "div",
        attributes: {},
        children: [{ tag: "div", attributes: {}, children: [] }],
      },
    ]),
    "<div><div></div></div>"
  );
});

Deno.test("Applies is MSO tag", () => {
  assertEquals(
    ToXml([
      {
        tag: "EMAIL_IS_MSO",
        attributes: {},
        children: [{ tag: "div", attributes: {}, children: [] }],
      },
    ]),
    "<!--[if mso]><div></div><![endif]-->"
  );
});

Deno.test("Applies not MSO tag", () => {
  assertEquals(
    ToXml([
      {
        tag: "EMAIL_NOT_MSO",
        attributes: {},
        children: [{ tag: "div", attributes: {}, children: [] }],
      },
    ]),
    "<!--[if !mso]><!--><div></div><!--<![endif]-->"
  );
});
