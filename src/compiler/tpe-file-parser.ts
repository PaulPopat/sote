import {
  ParseXml,
  XmlNode,
  IsElement,
  XmlElement,
  IsText,
  XmlText,
} from "./xml-parser";
import { CompileCss } from "./css-manipulator";
import { ApplySpecifier } from "./tpe-manipulator";
import * as Babel from "@babel/core";
import fs from "fs-extra";

export type TpeFile = {
  server_js?: NodeJS.Dict<string>;
  client_js?: string;
  xml_template: XmlNode[];
  css?: string;
  title?: string;
};

type XmlScript = {
  tag: string;
  attributes: { method?: string };
  children: [XmlText];
};

function ValidText(e: XmlElement): e is XmlScript {
  return e.children.length === 1 && IsText(e.children[0]);
}

function TransformJs(js: string) {
  const result = Babel.transformSync(js, {
    presets: ["@babel/preset-env"],
    plugins: [
      "@babel/plugin-proposal-class-properties",
      ["@babel/plugin-transform-runtime", { regenerator: true }],
    ],
  });

  if (!result) {
    return "";
  }

  return result.code ?? "";
}

export function ParseTpeFile(tpe: string) {
  const xml_model = ParseXml(tpe);
  const find = (tag: string, attributes: NodeJS.Dict<string>) =>
    xml_model.filter((n) =>
      IsElement(n)
        ? n.tag === tag &&
          Object.keys(attributes).find(
            (k) => n.attributes[k] !== attributes[k]
          ) == null
        : false
    ) as XmlElement[];

  const get_text_script = (
    tag: string,
    attributes: NodeJS.Dict<string>,
    allow_multiple: boolean
  ) => {
    const elements = find(tag, attributes);
    if (elements.length === 0) {
      return undefined;
    }

    const id_text = [
      ...Object.keys(attributes).map((k) => attributes[k]),
      tag,
    ].join(" ");

    if (elements.length > 1 && !allow_multiple) {
      throw new Error(`More than one ${id_text} element`);
    }

    return elements
      .map((e, i) => {
        const build_string = (text: string) =>
          typeof e.attributes["no-hash"] === "string"
            ? "/* DATA: NO_HASH */" + text + "/* DATA: END_NO_HASH */"
            : typeof e.attributes["babel"] === "string"
            ? TransformJs(text)
            : text;
        if (e.attributes.src) {
          return build_string(fs.readFileSync(e.attributes.src, "utf-8"));
        }

        if (!ValidText(e)) {
          throw new Error(`${id_text} ${i} is not a valid script`);
        }

        return build_string(e.children[0].text);
      })
      .join("\n");
  };

  const xml_template = find("template", {});
  if (xml_template.length !== 1) {
    throw new Error("No xml template in TPE file");
  }

  const server_js_e = find("script", { area: "server" }).filter(ValidText);
  const css_text = get_text_script("style", {}, true);
  const { css, hash } = CompileCss(css_text);
  return {
    xml_template: hash
      ? ApplySpecifier(xml_template[0].children, hash)
      : xml_template[0].children,
    server_js: server_js_e.reduce(
      (c, n) => ({
        ...c,
        [n.attributes.method ?? "get"]: n.children[0].text,
      }),
      {} as NodeJS.Dict<string>
    ),
    client_js: get_text_script("script", { area: "client" }, true),
    css: css,
    title: get_text_script("title", {}, false),
    description: get_text_script("description", {}, false),
  };
}
