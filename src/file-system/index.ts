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

export async function GetCompiledApp(path: string): Promise<PagesModel> {
  return await fs.readJson(path);
}

export async function WriteCompiledApp(path: string, app: PagesModel) {
  await fs.outputJson(path, app);
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
  port: Optional(IsNumber),
  resources: Optional(IsString),
  email: Optional(IsBoolean),
  google_tracking_id: Optional(IsString),
  sass_variables: Optional(IsString),
});

export type Options = IsType<typeof IsOptions>;

export async function GetOptions(path: string): Promise<Options> {
  if (await fs.pathExists(path)) {
    const json = await fs.readJson(path);
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
    port: undefined,
    resources: undefined,
    email: undefined,
    google_tracking_id: undefined,
    sass_variables: undefined,
  };
}

export async function GetSassVariables(options: Options) {
  if (!options.sass_variables) {
    return "";
  }

  return await fs.readFile(options.sass_variables, "utf-8");
}
