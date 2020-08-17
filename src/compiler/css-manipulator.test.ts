import { CompileCss } from "./css-manipulator";

it("It minifies css", () => {
  // Arrange
  const css = `.random-selector { 
    display: block; 
  }`;

  // Act
  const result = CompileCss(css);

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
  const result = CompileCss(css);

  // Assert
  expect(result).toStrictEqual({
    css:
      '.random-selector[data-specifier="c41489a3d173e121d23959e834fed9bb"]{display:block;}',
    hash: "c41489a3d173e121d23959e834fed9bb",
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
  const result = CompileCss(css);

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
    .random-selector { display: block; }
    /* DATA: NO_HASH */
    .random-selector { display: block; }
    /* DATA: END_NO_HASH */
    .random-selector { display: block; }
  `;

  // Act
  const result = CompileCss(css);

  // Assert
  expect(result).toStrictEqual({
    css: `.random-selector[data-specifier="8a1bbcecffa251ed59fc98c5c0f3ba74"]{display:block;}.random-selector[data-specifier="8a1bbcecffa251ed59fc98c5c0f3ba74"]{display:block;}
    .random-selector { display: block; }
    `,
    hash: "8a1bbcecffa251ed59fc98c5c0f3ba74",
  });
});
