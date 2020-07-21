import "jest";
import "@testing-library/jest-dom/extend-expect";
import CreateBuilder from "./template-parser";
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
  const Builder = CreateBuilder({});
  const page = `<div>Hello world</div>`;
  const props = {};

  // Act
  const result = new JSDOM(Builder(layout, page, props));

  // Assert
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
});

it("Renders a basic page", () => {
  // Arrange
  const Builder = CreateBuilder({});
  const page = `<div>Hello world</div>`;
  const props = {};

  // Act
  const result = new JSDOM(Builder(layout, page, props));

  // Assert
  expect(result.window.document.body).toContainHTML(`<div>Hello world</div>`);
});

it("Resolves props", () => {
  // Arrange
  const Builder = CreateBuilder({});
  const page = `<div>{props.text}</div>`;
  const props = { text: "Hello world" };

  // Act
  const result = new JSDOM(Builder(layout, page, props));

  // Assert
  expect(result.window.document.body).toContainHTML(`<div>Hello world</div>`);
});

it("Resolves props function", () => {
  // Arrange
  const Builder = CreateBuilder({});
  const page = `<div>{props.text()}</div>`;
  const props = { text: () => "Hello world" };

  // Act
  const result = new JSDOM(Builder(layout, page, props));

  // Assert
  expect(result.window.document.body).toContainHTML(`<div>Hello world</div>`);
});

it("Resolves JavaScript expression", () => {
  // Arrange
  const Builder = CreateBuilder({});
  const page = `<div>{props.hello + props.world}</div>`;
  const props = { hello: "Hello ", world: "world" };

  // Act
  const result = new JSDOM(Builder(layout, page, props));

  // Assert
  expect(result.window.document.body).toContainHTML(`<div>Hello world</div>`);
});

it("Renders components", () => {
  // Arrange
  const Builder = CreateBuilder({ test: `<div><CHILDREN></CHILDREN></div>` });
  const page = `<test>Hello world</test>`;
  const props = {};

  // Act
  const result = new JSDOM(Builder(layout, page, props));

  // Assert
  expect(result.window.document.body).toContainHTML(`<div>Hello world</div>`);
});

it("Passes props to a component", () => {
  // Arrange
  const Builder = CreateBuilder({ test: `<div>{props.name}</div>` });
  const page = `<test name="Hello world"></test>`;
  const props = {};

  // Act
  const result = new JSDOM(Builder(layout, page, props));

  // Assert
  expect(result.window.document.body).toContainHTML(`<div>Hello world</div>`);
});

it("Passes deep props to a component", () => {
  // Arrange
  const Builder = CreateBuilder({ test: `<div>{props.name.text}</div>` });
  const page = `<test name=":{ text: 'Hello world' }"></test>`;
  const props = {};

  // Act
  const result = new JSDOM(Builder(layout, page, props));

  // Assert
  expect(result.window.document.body).toContainHTML(`<div>Hello world</div>`);
});

it("Rendered for loops", () => {
  // Arrange
  const Builder = CreateBuilder({});
  const page = `<div><for subject=":props.data" key="item"><div>{props.item}</div></for></div>`;
  const props = { data: [1, 2, 3, 4, 5] };

  // Act
  const result = new JSDOM(Builder(layout, page, props));

  // Assert
  expect(result.window.document.body).toContainHTML(
    `<div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div></div>`
  );
});

it("Renders if true", () => {
  // Arrange
  const Builder = CreateBuilder({});
  const page = `<div><if check=":props.data"><div>Hello world</div></if></div>`;
  const props = { data: true };

  // Act
  const result = new JSDOM(Builder(layout, page, props));

  // Assert
  expect(result.window.document.body).toContainHTML(
    `<div><div>Hello world</div></div>`
  );
});

it("Does not render if false", () => {
  // Arrange
  const Builder = CreateBuilder({});
  const page = `<div><if check=":props.data"><div>Hello world</div></if></div>`;
  const props = { data: false };

  // Act
  const result = new JSDOM(Builder(layout, page, props));

  // Assert
  expect(result.window.document.body).toContainHTML(
    `<div></div>`
  );
});
