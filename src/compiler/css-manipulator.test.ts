import { CompileCss } from "./css-manipulator"; 
 
it("It minifies css", () => { 
  // Arrange 
  const css = `.random-selector { 
    display: block; 
  }`; 
  const specifier = ""; 
 
  // Act 
  const result = CompileCss(css, specifier); 
 
  // Assert 
  expect(result).toBe(`.random-selector{display:block;}`); 
}); 
 
it("Adds specifier to css to a rule", () => { 
  // Arrange 
  const css = `.random-selector { display: block; }`; 
  const specifier = "test-specifier"; 
 
  // Act 
  const result = CompileCss(css, specifier); 
 
  // Assert 
  expect(result).toBe( 
    `.random-selector[data-specifier="test-specifier"]{display:block;}` 
  ); 
}); 
 
it("Adds specifier to css to a rule within a media query", () => { 
  // Arrange 
  const css = ` 
    @media (min-width: 123px) { 
      .random-selector { display: block; } 
    } 
  `; 
  const specifier = "test-specifier"; 
 
  // Act 
  const result = CompileCss(css, specifier); 
 
  // Assert 
  expect(result).toBe( 
    `@media (min-width: 123px){.random-selector[data-specifier="test-specifier"]{display:block;}}` 
  ); 
}); 
