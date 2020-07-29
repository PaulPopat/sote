function* Chunk(css: string) {
  let current = "";
  let depth = 0;
  for (const char of css) {
    current += char;

    if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        yield current;
        current = "";
      }
    }

    if (char === "{") {
      depth += 1;
    }
  }
}

type CssFiles = { name: string; css: string }[];
type ParsedCssFiles = { name: string; css: string[] }[];

function GetMatchingCount(rule: string, files: ParsedCssFiles) {
  return files.filter((p) => p.css.find((r) => rule === r)).length;
}

export function ChunkCss(css: CssFiles): { common: string; files: CssFiles } {
  let parsed = css.map((c) => ({ ...c, css: [...Chunk(c.css)] }));
  if (!parsed.length) {
    return {
      common: "",
      files: [],
    };
  }

  let common = "";
  for (const rule of parsed[0].css) {
    if (GetMatchingCount(rule, parsed) < parsed.length) {
      continue;
    }

    common += rule;
    parsed = parsed.map((c) => ({
      ...c,
      css: c.css.filter((r) => r !== rule),
    }));
  }

  return {
    common,
    files: parsed.map((c) => ({ ...c, css: c.css.join("") })),
  };
}
