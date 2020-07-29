import { ChunkCss } from "./chunk-css";

it("Extracts common css", () => {
  expect(
    ChunkCss([
      { name: "test-1", css: `.test-selector{display:block;}` },
      { name: "test-2", css: `.test-selector{display:block;}` },
    ])
  ).toEqual({
    common: `.test-selector{display:block;}`,
    files: [
      { name: "test-1", css: "" },
      { name: "test-2", css: "" },
    ],
  });
});

it("Ignores uncommon chunks", () => {
  expect(
    ChunkCss([
      {
        name: "test-1",
        css: `.test-selector{display:block;}.another{display:block;}`,
      },
      { name: "test-2", css: `.test-selector{display:block;}` },
    ])
  ).toEqual({
    common: `.test-selector{display:block;}`,
    files: [
      { name: "test-1", css: ".another{display:block;}" },
      { name: "test-2", css: "" },
    ],
  });
});

it("Ignores chunk with over 80% commonness", () => {
  expect(
    ChunkCss([
      { name: "test-1", css: `.test-selector{display:block;}` },
      { name: "test-2", css: `.test-selector{display:block;}` },
      { name: "test-3", css: `.test-selector{display:block;}` },
      { name: "test-4", css: `.test-selector{display:block;}` },
      { name: "test-5", css: `.test-selector{display:block;}` },
      { name: "test-6", css: `.test-selector{display:block;}` },
      { name: "test-7", css: `.test-selector{display:block;}` },
      { name: "test-8", css: `.test-selector{display:block;}` },
      { name: "test-9", css: `.test-selector{display:block;}` },
      { name: "test-0", css: `.test-selector{display:none;}` },
    ])
  ).toEqual({
    common: ``,
    files: [
      { name: "test-1", css: `.test-selector{display:block;}` },
      { name: "test-2", css: `.test-selector{display:block;}` },
      { name: "test-3", css: `.test-selector{display:block;}` },
      { name: "test-4", css: `.test-selector{display:block;}` },
      { name: "test-5", css: `.test-selector{display:block;}` },
      { name: "test-6", css: `.test-selector{display:block;}` },
      { name: "test-7", css: `.test-selector{display:block;}` },
      { name: "test-8", css: `.test-selector{display:block;}` },
      { name: "test-9", css: `.test-selector{display:block;}` },
      { name: "test-0", css: `.test-selector{display:none;}` },
    ],
  });
});
