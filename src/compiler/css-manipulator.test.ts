import { CompileCss } from "./css-manipulator";

it("It minifies css", () => {
  // Arrange
  const css = `.random-selector { 
    display: block; 
  }`;

  // Act
  const result = CompileCss(css, "");

  // Assert
  expect(result).toStrictEqual({
    css:
      '.random-selector[data-specifier="17747583ac5d4d85d496702c9eb99d89"]{display:block;}',
    hash: "17747583ac5d4d85d496702c9eb99d89",
  });
});

it("Adds specifier to css to a rule", () => {
  // Arrange
  const css = `.random-selector { display: block; }`;

  // Act
  const result = CompileCss(css, "");

  // Assert
  expect(result).toStrictEqual({
    css:
      '.random-selector[data-specifier="c41489a3d173e121d23959e834fed9bb"]{display:block;}',
    hash: "c41489a3d173e121d23959e834fed9bb",
  });
});

it("Compiles sass", () => {
  // Arrange
  const css = `.random-selector { color: $test-colour; }`;

  // Act
  const result = CompileCss(css, "$test-colour: #333;");

  // Assert
  expect(result).toStrictEqual({
    css:
      '.random-selector[data-specifier="94a4ee5c06b8b5d8910991db82fd8183"]{color:#333;}',
    hash: "94a4ee5c06b8b5d8910991db82fd8183",
  });
});

it("Adds specifier to css to a rule within a media query", () => {
  // Arrange
  const css = ` 
    @media (min-width: 123px) { 
      .random-selector { display: block; } 
    } 
  `;

  // Act
  const result = CompileCss(css, "");

  // Assert
  expect(result).toStrictEqual({
    css:
      '@media (min-width: 123px){.random-selector[data-specifier="08eb4a7a362ceb3acab8015635255a21"]{display:block;}}',
    hash: "08eb4a7a362ceb3acab8015635255a21",
  });
});

it("Separates and excludes no hash", () => {
  // Arrange
  const css = ` 
    .random-selector { display: $display; }
    /* DATA: NO_HASH */
    .random-selector { display: $display; }
    /* DATA: END_NO_HASH */
    .random-selector { display: $display; }
  `;

  // Act
  const result = CompileCss(css, "$display: block;");

  // Assert
  expect(result).toStrictEqual({
    css: [
      `.random-selector[data-specifier="91e0e3dfdbc37ad64e6ea06d09b3c511"]{display:block;}`,
      `.random-selector[data-specifier="91e0e3dfdbc37ad64e6ea06d09b3c511"]{display:block;}`,
      `.random-selector{display:block}`,
    ].join(""),
    hash: "91e0e3dfdbc37ad64e6ea06d09b3c511",
  });
});
