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
 
export function CompileCss(css_string: string, specifier?: string) { 
  const data = css.parse(css_string); 
  if (specifier && data.stylesheet) { 
    data.stylesheet.rules = data.stylesheet.rules.map((r) => 
      MapRule(r, specifier) 
    ); 
  } 
 
  return css.stringify(data, { compress: true }); 
} 
