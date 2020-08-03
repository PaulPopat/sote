import "jest";
import "@testing-library/jest-dom/extend-expect";
import Builder from "./template-parser";
import { JSDOM } from "jsdom";

const layout = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />

    <title>A simple HTML5 test</title>
    <meta name="description" content="A simple HTML5 test" />
    <meta name="author" content="Paul Popat" />
    <link rel="stylesheet" type="text/css" href="/rendered-sass.css" />
  </head>

  <body>
    <BODY_CONTENT></BODY_CONTENT>
  </body>
</html>
`;

it("Applies the layout", () => {
  // Arrange
  const page = layout.replace(
    "<BODY_CONTENT></BODY_CONTENT>",
    `<div>Hello world</div>`
  );
  const props = {};

  // Act
  const html = Builder(page, props);

  // Assert
  const result = new JSDOM(html);
  expect(result.window.document.head).toContainHTML(`<meta charset="utf-8">`);
  expect(result.window.document.head).toContainHTML(
    `<title>A simple HTML5 test</title>`
  );
  expect(result.window.document.head).toContainHTML(
    `<meta name="description" content="A simple HTML5 test">`
  );
  expect(result.window.document.head).toContainHTML(
    `<meta name="author" content="Paul Popat">`
  );
  expect(result.window.document.head).toContainHTML(
    `<link rel="stylesheet" type="text/css" href="/rendered-sass.css">`
  );
  expect(html).toContain('<html lang="en">');
  expect(html).toContain("</html>");
  expect(html).toContain("<!DOCTYPE html>");
});

it("Renders a basic page", () => {
  // Arrange
  const page = layout.replace(
    "<BODY_CONTENT></BODY_CONTENT>",
    `<div>Hello world</div>`
  );
  const props = {};

  // Act
  const result = new JSDOM(Builder(page, props));

  // Assert
  expect(result.window.document.body).toContainHTML(`<div>Hello world</div>`);
});

it("Trims whitespace", () => {
  // Arrange
  const page = layout.replace(
    "<BODY_CONTENT></BODY_CONTENT>",
    `<div>
      Hello world
    </div>`
  );
  const props = {};

  // Act
  const result = new JSDOM(Builder(page, props));

  // Assert
  expect(result.window.document.body).toContainHTML(`<div>Hello world</div>`);
});

it("Trims multiline whitespace", () => {
  // Arrange
  const page = layout.replace(
    "<BODY_CONTENT></BODY_CONTENT>",
    `<div>
      Hello
      world
    </div>`
  );
  const props = {};

  // Act
  const result = new JSDOM(Builder(page, props));

  // Assert
  expect(result.window.document.body).toContainHTML(`<div>Hello world</div>`);
});

it("Preserves whitespace from expressions", () => {
  // Arrange
  const page = layout.replace(
    "<BODY_CONTENT></BODY_CONTENT>",
    `<div>{" "}Hello world{" "}</div>`
  );
  const props = {};

  // Act
  const result = new JSDOM(Builder(page, props));

  // Assert
  expect(result.window.document.body).toContainHTML(`<div> Hello world </div>`);
});

it("Allows string interpolation in expressions", () => {
  // Arrange
  const page = layout.replace(
    "<BODY_CONTENT></BODY_CONTENT>",
    `<div>{\` $\{props.text} \`}</div>`
  );
  const props = { text: "Hello world" };

  // Act
  const result = new JSDOM(Builder(page, props));

  // Assert
  expect(result.window.document.body).toContainHTML(`<div> Hello world </div>`);
});

it("Preservers comments comments", () => {
  // Arrange
  const page = layout.replace(
    "<BODY_CONTENT></BODY_CONTENT>",
    `<div>Hello <!--this is a comment--> world</div>`
  );
  const props = {};

  // Act
  const result = new JSDOM(Builder(page, props));

  // Assert
  expect(result.window.document.body).toContainHTML(
    `<div>Hello<!--this is a comment-->world</div>`
  );
});

it("Does not error if there is a comment with an invalid expression", () => {
  // Arrange
  const page = layout.replace(
    "<BODY_CONTENT></BODY_CONTENT>",
    `<div>Hello <!--<div>{props.this.is.invalid}</div>--> world</div>`
  );
  const props = {};

  // Act
  const result = new JSDOM(Builder(page, props));

  // Assert
  expect(result.window.document.body.innerHTML).toBe(
    `<div>Hello<!--<div>{props.this.is.invalid}</div>-->world</div>`
  );
});

it("Resolves props", () => {
  // Arrange
  const page = layout.replace(
    "<BODY_CONTENT></BODY_CONTENT>",
    `<div>{props.text}</div>`
  );
  const props = { text: "Hello world" };

  // Act
  const result = new JSDOM(Builder(page, props));

  // Assert
  expect(result.window.document.body).toContainHTML(`<div>Hello world</div>`);
});

it("Encodes HTML", () => {
  // Arrange
  const page = layout.replace(
    "<BODY_CONTENT></BODY_CONTENT>",
    `<div>{props.text}</div>`
  );
  const props = { text: "<div>Hello world</div>" };

  // Assert
  expect(Builder(page, props)).toContain(
    `<div>&lt;div&gt;Hello world&lt;/div&gt;</div>`
  );
});

it("Resolves empty string attributes", () => {
  // Arrange
  const page = layout.replace(
    "<BODY_CONTENT></BODY_CONTENT>",
    `<form action="" method="POST">{props.text}</form>`
  );
  const props = { text: "Hello world" };

  // Act
  const result = new JSDOM(Builder(page, props));

  // Assert
  expect(result.window.document.body).toContainHTML(
    `<form action="" method="POST">Hello world</form>`
  );
});

it("Does not error", () => {
  // Arrange
  const page = layout.replace(
    "<BODY_CONTENT></BODY_CONTENT>",
    `<form action="" method="POST">
    <input type="hidden" name="text" id="content-text">
    <button type="submit">Submit</button>
</form>`
  );
  const props = {};

  // Act / Assert
  expect(() => new JSDOM(Builder(page, props))).not.toThrow();
});

it("Resolves props function", () => {
  // Arrange
  const page = layout.replace(
    "<BODY_CONTENT></BODY_CONTENT>",
    `<div>{props.text()}</div>`
  );
  const props = { text: () => "Hello world" };

  // Act
  const result = new JSDOM(Builder(page, props));

  // Assert
  expect(result.window.document.body).toContainHTML(`<div>Hello world</div>`);
});

it("Resolves JavaScript expression", () => {
  // Arrange
  const page = layout.replace(
    "<BODY_CONTENT></BODY_CONTENT>",
    `<div>{props.hello + props.world}</div>`
  );
  const props = { hello: "Hello ", world: "world" };

  // Act
  const result = new JSDOM(Builder(page, props));

  // Assert
  expect(result.window.document.body).toContainHTML(`<div>Hello world</div>`);
});

it("Renders for loops", () => {
  // Arrange
  const page = layout.replace(
    "<BODY_CONTENT></BODY_CONTENT>",
    `<div><for subject=":props.data" key="item"><div>{props.item}</div></for></div>`
  );
  const props = { data: [1, 2, 3, 4, 5] };

  // Act
  const result = new JSDOM(Builder(page, props));

  // Assert
  expect(result.window.document.body).toContainHTML(
    `<div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div></div>`
  );
});

it("Renders whitespace in for loops", () => {
  // Arrange
  const page = layout.replace(
    "<BODY_CONTENT></BODY_CONTENT>",
    `<div><for subject=":props.data" key="item">{" "}<div>{props.item}</div></for></div>`
  );
  const props = { data: [1, 2, 3, 4, 5] };

  // Act
  const result = new JSDOM(Builder(page, props));

  // Assert
  expect(result.window.document.body).toContainHTML(
    `<div> <div>1</div> <div>2</div> <div>3</div> <div>4</div> <div>5</div></div>`
  );
});

it("Renders if true", () => {
  // Arrange
  const page = layout.replace(
    "<BODY_CONTENT></BODY_CONTENT>",
    `<div><if check=":props.data"><div>Hello world</div></if></div>`
  );
  const props = { data: true };

  // Act
  const result = new JSDOM(Builder(page, props));

  // Assert
  expect(result.window.document.body).toContainHTML(
    `<div><div>Hello world</div></div>`
  );
});

it("Does not render if false", () => {
  // Arrange
  const page = layout.replace(
    "<BODY_CONTENT></BODY_CONTENT>",
    `<div><if check=":props.data"><div>Hello world</div></if></div>`
  );
  const props = { data: false };

  // Act
  const result = new JSDOM(Builder(page, props));

  // Assert
  expect(result.window.document.body).toContainHTML(`<div></div>`);
});

it("Can access a deep object multiple times", () => {
  // Arrange
  const page = layout.replace(
    "<BODY_CONTENT></BODY_CONTENT>",
    `<div>{props.deep.part1}</div><div>{props.deep.part2}</div>`
  );
  const props = { deep: { part1: "Part1", part2: "Part2" } };

  // Act
  const result = new JSDOM(Builder(page, props));

  // Assert
  expect(result.window.document.body).toContainHTML(
    `<div>Part1</div><div>Part2</div>`
  );
});

it("Parses SVG data", () => {
  // Arrange
  const page = layout.replace(
    "<BODY_CONTENT></BODY_CONTENT>",
    `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox=":props.box"
    >
      <path d="M1 1"></path>
    </svg>`
  );
  const props = { box: "0 0 1000 1000" };

  // Act
  const result = new JSDOM(Builder(page, props));

  // Assert
  expect(result.window.document.body.querySelector("path")).not.toBeNull();
  expect(result.window.document.body.querySelector("path")).not.toBeFalsy();
});
