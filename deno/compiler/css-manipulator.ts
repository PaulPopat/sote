import { lex, Token } from "https://deno.land/x/css@0.2.0/mod.ts";
import { createHash } from "https://deno.land/std@0.87.0/hash/mod.ts";

function Matcher(phrase: string) {
  let index = 0;
  return (char: string) => {
    if (char === phrase[index]) {
      index++;
    }

    if (index === phrase.length) {
      return true;
    }

    return false;
  };
}

function SeparateNoHash(css_string: string) {
  let to_hash = "";
  let no_hash = "";
  let hash = true;
  let matcher = Matcher("/* DATA: NO_HASH */");
  for (const char of css_string) {
    if (hash) {
      to_hash += char;
    } else {
      no_hash += char;
    }

    if (matcher(char)) {
      hash = !hash;

      if (hash) {
        matcher = Matcher("/* DATA: NO_HASH */");
      } else {
        matcher = Matcher("/* DATA: END_NO_HASH */");
      }
    }
  }

  return {
    to_hash: to_hash
      .replace(/\/\* DATA: NO_HASH \*\//gm, "")
      .replace(/\/\* DATA: END_NO_HASH \*\//gm, ""),
    no_hash: no_hash
      .replace(/\/\* DATA: NO_HASH \*\//gm, "")
      .replace(/\/\* DATA: END_NO_HASH \*\//gm, ""),
  };
}

function HashRule(rule: Token, css_hash: string) {
  if (rule.type === "selector") {
    return {
      ...rule,
      text: rule.text
        ?.split(",")
        .map((t) => t.trim() + `[data-specifier="${css_hash}"]`)
        .join(","),
    };
  }
  return rule;
}

function WriteMinified(rules: Token[]) {
  return rules
    .map((r) => {
      switch (r.type) {
        case "selector":
          return r.text + "{";
        case "property":
          return `${r.name}:${r.value};`;
        case "end":
          return "}";
        case "media":
          return `@media ${r.name}{`;
      }

      return "";
    })
    .join("");
}

export function CompileCss(sass_string: string | undefined) {
  if (!sass_string) {
    return { css: undefined, hash: undefined };
  }

  const { to_hash, no_hash } = SeparateNoHash(sass_string);
  if (!to_hash) {
    return {
      css: WriteMinified(lex(no_hash)),
      hash: undefined,
    };
  }

  const md5 = createHash("md5");
  md5.update(to_hash);
  const css_hash = md5.toString();
  let data = lex(to_hash);
  if (css_hash) {
    data = data.map((r) => HashRule(r, css_hash));
  }

  return {
    css: WriteMinified(data) + WriteMinified(lex(no_hash)),
    hash: css_hash,
  };
}
