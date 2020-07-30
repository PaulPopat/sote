import fs from "fs-extra";
import {
  IsObject,
  Optional,
  IsString,
  IsUnion,
  IsArray,
  IsBoolean,
} from "@paulpopat/safe-type";
import { Assert, ArrayIfNotArray, PromiseType } from "./types";
import path from "path";
import { CacheInProduction } from "./cache";

const IsOptions = IsObject({
  components: Optional(IsUnion(IsString, IsArray(IsString))),
  pages: Optional(IsString),
  layout: Optional(IsString),
  port: Optional(IsString),
  static: Optional(IsString),
  sass: Optional(IsString),
  css_in_style_tag: Optional(IsBoolean),
});

function ParseQueryString(): { [key: string]: string } {
  const result: { [key: string]: string } = {};
  for (const arg of process.argv) {
    if (arg.startsWith("--")) {
      const [s, o] = arg.split("=");
      if (o.startsWith('"') || o.startsWith("'")) {
        result[s.replace("--", "")] = o.slice(1, o.length - 1);
      } else {
        result[s.replace("--", "")] = o;
      }
    }
  }

  return result;
}

async function ReadOptionsFile(): Promise<{ [key: string]: string }> {
  if (!(await fs.pathExists("./tpe-config.json"))) {
    return {};
  }

  console.log("Found a config file so pulling settings from there.");
  return await fs.readJson("./tpe-config.json");
}

export async function GetOptions() {
  const options = { ...(await ReadOptionsFile()), ...ParseQueryString() };
  Assert(IsOptions, options, "Invalid command line parameters");
  const pages = path.normalize(options.pages ?? "./src/pages");
  const components = ArrayIfNotArray(
    options.components ?? "./src/components"
  ).map(path.normalize);
  const layout = path.normalize(options.layout ?? "./src/layout.html");
  const sass = options.sass && path.normalize(options.sass);
  const staticroute = options.static && path.normalize(options.static);
  const GetLayout = CacheInProduction(() => fs.readFile(layout, "utf-8"));

  const mode = process.argv.find((a) => a === "build")
    ? ("build" as const)
    : process.argv.find((a) => a === "start")
    ? ("start" as const)
    : ("dev" as const);
  return {
    GetLayout,
    sass,
    staticroute,
    components,
    pages,
    port: options.port,
    mode: mode,
    css_in_tag: options.css_in_style_tag ?? false
  };
}

export type Options = PromiseType<ReturnType<typeof GetOptions>>;
