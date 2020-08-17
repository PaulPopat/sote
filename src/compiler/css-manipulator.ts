import css, {
  AtRule,
  Rule,
  Comment,
  Document,
  StyleRules,
  Host,
  Media,
  Supports,
} from "css";
import crypto from "crypto";

type RuleType = Document | StyleRules | Host | Media | Supports;

function IsRuleType(item: Rule | Comment | AtRule): item is RuleType {
  return "rules" in item;
}

function IsRule(item: Rule | Comment | AtRule): item is Rule {
  return item.type === "rule";
}

function MapRule(r: Rule | Comment | AtRule, specifier: string): typeof r {
  return IsRuleType(r)
    ? {
        ...r,
        rules: r.rules?.map((r) => MapRule(r, specifier)),
      }
    : {
        ...r,
        selectors: IsRule(r)
          ? r.selectors?.map((s) => s + `[data-specifier="${specifier}"]`)
          : undefined,
      };
}

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

export function CompileCss(css_string: string | undefined) {
  if (!css_string) {
    return { css: undefined, hash: undefined };
  }

  const { to_hash, no_hash } = SeparateNoHash(css_string);
  if (!to_hash) {
    return {
      css: no_hash || undefined,
      hash: undefined,
    };
  }

  const css_hash = crypto.createHash("md5").update(to_hash).digest("hex");
  const data = css.parse(to_hash);
  if (css_hash && data.stylesheet) {
    data.stylesheet.rules = data.stylesheet.rules.map((r) =>
      MapRule(r, css_hash)
    );
  }

  return {
    css:
      css.stringify(data, { compress: true }) +
      no_hash.replace(/\/\* DATA: END_NO_HASH \*\//gm, ""),
    hash: css_hash,
  };
}
