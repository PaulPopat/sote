import { CompileCss } from "./css-manipulator.ts";
import { assertEquals } from "https://deno.land/std@0.86.0/testing/asserts.ts";

Deno.test("It minifies css", () => {
  // Arrange
  const css = `.random-selector { 
    display: block; 
  }`;

  // Act
  const result = CompileCss(css);

  // Assert
  assertEquals(result, {
    css:
      '.random-selector[data-specifier="17747583ac5d4d85d496702c9eb99d89"]{display:block;}',
    hash: "17747583ac5d4d85d496702c9eb99d89",
  });
});

Deno.test("Adds specifier to css to a rule", () => {
  // Arrange
  const css = `.random-selector { display: block; }`;

  // Act
  const result = CompileCss(css);

  // Assert
  assertEquals(result, {
    css:
      '.random-selector[data-specifier="c41489a3d173e121d23959e834fed9bb"]{display:block;}',
    hash: "c41489a3d173e121d23959e834fed9bb",
  });
});

Deno.test("Supports multiple selectors", () => {
  // Arrange
  const css = `.random-selector, .other-selector { display: block; }`;

  // Act
  const result = CompileCss(css);

  // Assert
  assertEquals(result, {
    css:
      '.random-selector[data-specifier="a0936a64c921a47099143a5583fcccba"],.other-selector[data-specifier="a0936a64c921a47099143a5583fcccba"]{display:block;}',
    hash: "a0936a64c921a47099143a5583fcccba",
  });
});

Deno.test("Adds specifier to css to a rule within a media query", () => {
  // Arrange
  const css = ` 
    @media (min-width: 123px) { 
      .random-selector { display: block; } 
    } 
  `;

  // Act
  const result = CompileCss(css);

  // Assert
  assertEquals(result, {
    css:
      '@media (min-width: 123px){.random-selector[data-specifier="08eb4a7a362ceb3acab8015635255a21"]{display:block;}',
    hash: "08eb4a7a362ceb3acab8015635255a21",
  });
});

Deno.test("Separates and excludes no hash", () => {
  // Arrange
  const css = ` 
    .random-selector { display: block; }
    /* DATA: NO_HASH */
    .random-selector { display: block; }
    /* DATA: END_NO_HASH */
    .other-selector { display: block; }
  `;

  // Act
  const result = CompileCss(css);

  // Assert
  assertEquals(result, {
    css:
      '.random-selector[data-specifier="1960fabc4b19465b20ab0564f45648ff"]{display:block;}.other-selector[data-specifier="1960fabc4b19465b20ab0564f45648ff"]{display:block;}.random-selector{display:block;}',
    hash: "1960fabc4b19465b20ab0564f45648ff",
  });
});
