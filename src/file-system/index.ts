import fs from "fs-extra";
import path from "path";
import { PagesModel } from "../compiler/page-builder";
import {
  IsObject,
  Optional,
  IsString,
  IsArray,
  IsUnion,
  Assert,
  IsType,
  IsBoolean,
  IsNumber,
} from "@paulpopat/safe-type";

export async function ReadDirectory(route: string): Promise<string[]> {
  const result: string[] = [];
  const files = await fs.readdir(route);
  for (const file of files) {
    const p = path.join(route, file);
    const stats = await fs.stat(p);
    if (stats.isDirectory()) {
      result.push(...(await ReadDirectory(p)));
    } else {
      result.push(p);
    }
  }

  return result;
}

export async function GetAllTpe(pages_route: string) {
  const files = await ReadDirectory(pages_route);
  return await Promise.all(
    files
      .filter((f) => f.endsWith(".tpe"))
      .map(async (f) => {
        let url = path
          .relative(pages_route, f)
          .replace(".tpe", "")
          .replace("\\", "/");
        if (url.startsWith(".")) {
          url.replace(".", "");
        }

        if (!url.startsWith("/")) {
          url = "/" + url;
        }

        url = url.replace(/\/index/gm, "");

        return {
          path: url,
          text: await fs.readFile(path.resolve(f), "utf-8"),
        };
      })
  );
}

export async function GetCompiledApp(): Promise<PagesModel> {
  return await fs.readJson("./.sote/app.json");
}

export async function WriteCompiledApp(app: PagesModel) {
  await fs.writeJson("./.sote/app.json", app);
}

const IsOptions = IsObject({
  static: Optional(IsString),
  pages: Optional(IsString),
  components: Optional(
    IsArray(IsUnion(IsObject({ path: IsString, prefix: IsString }), IsString))
  ),
  author: Optional(IsString),
  favicon: Optional(IsArray(IsObject({ path: IsString, size: IsString }))),
  behavior_in_tag: Optional(IsBoolean),
  lang: Optional(IsString),
  resources: Optional(IsString),
  port: Optional(IsNumber),
});

export type Options = IsType<typeof IsOptions>;

export async function GetOptions(): Promise<Options> {
  if (await fs.pathExists("./tpe-config.json")) {
    const json = await fs.readJson("./tpe-config.json");
    Assert(
      IsOptions,
      json,
      "Your tpe config is invalid. Please check the documentation."
    );
    return json;
  }

  return {
    static: undefined,
    pages: undefined,
    components: undefined,
    author: undefined,
    favicon: undefined,
    behavior_in_tag: undefined,
    lang: undefined,
    resources: undefined,
    port: undefined,
  };
}

export function GetResources(options: Options) {
  if (!options.resources) {
    return {};
  }

  return require(path.resolve(options.resources));
}
