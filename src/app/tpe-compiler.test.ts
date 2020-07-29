import { CompileTpe } from "./tpe-compiler";

const layout = `<!DOCTYPE html><html lang="en"><head></head><body><BODY_CONTENT></BODY_CONTENT></body></html>`;

it("Adds a component", () => {
  expect(
    CompileTpe(layout, `<paragraph>Hello world</paragraph>`, {
      paragraph: `<p><children></children></p>`,
    }).template
  ).toBe(layout.replace("<BODY_CONTENT></BODY_CONTENT>", `<p>Hello world</p>`));
});

it("Adds a component within a component", () => {
  expect(
    CompileTpe(layout, `<paragraph><other>Hello world</other></paragraph>`, {
      paragraph: `<p><children></children></p>`,
      other: `<span><children></children></span>`,
    }).template
  ).toBe(layout.replace("<BODY_CONTENT></BODY_CONTENT>", `<p><span>Hello world</span></p>`));
});

it("Adds a component within an element", () => {
  expect(
    CompileTpe(layout, `<p><other>Hello world</other></p>`, {
      paragraph: `<p><children></children></p>`,
      other: `<span><children></children></span>`,
    }).template
  ).toBe(layout.replace("<BODY_CONTENT></BODY_CONTENT>", `<p><span>Hello world</span></p>`));
});


it("Adds a component with multiple top level", () => {
  expect(
    CompileTpe(layout, `<paragraph>Hello world</paragraph>`, {
      paragraph: `<p><children></children></p><p>test</p>`,
    }).template
  ).toBe(
    layout.replace(
      "<BODY_CONTENT></BODY_CONTENT>",
      `<p>Hello world</p><p>test</p>`
    )
  );
});

it("Applies component props", () => {
  expect(
    CompileTpe(layout, `<paragraph class="test">Hello world</paragraph>`, {
      paragraph: `<p class=":props.class"><children></children></p>`,
    }).template
  ).toBe(
    layout.replace(
      "<BODY_CONTENT></BODY_CONTENT>",
      `<p class=":('test')">Hello world</p>`
    )
  );
});

it("Applies component props objects", () => {
  expect(
    CompileTpe(
      layout,
      `<paragraph class=":props.thing.other">Hello world</paragraph>`,
      {
        paragraph: `<p class=":props.class"><children></children></p>`,
      }
    ).template
  ).toBe(
    layout.replace(
      "<BODY_CONTENT></BODY_CONTENT>",
      `<p class=":(props.thing.other)">Hello world</p>`
    )
  );
});

it("Returns components used", () => {
  expect(
    CompileTpe(layout, `<paragraph>Hello world</paragraph>`, {
      paragraph: `<p><children></children></p>`,
    }).components
  ).toEqual(["paragraph"]);
});

it("Returns no components if none are used", () => {
  expect(
    CompileTpe(layout, `<div>Hello world</div>`, {
      paragraph: `<p><children></children></p>`,
    }).components
  ).toEqual([]);
});
