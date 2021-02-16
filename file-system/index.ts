import { Assert } from "https://deno.land/x/safe_type@2.2.3/mod.ts";
import * as Path from "https://deno.land/std/path/mod.ts";
import { IsPagesModel, PagesModel } from "../types/app.ts";
import { IsOptions, Options } from "../types/config.ts";

async function Exists(filename: string): Promise<boolean> {
  try {
    await Deno.stat(filename);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    } else {
      throw error;
    }
  }
}

export async function* ReadDirectory(route: string): AsyncIterable<string> {
  for await (const file of Deno.readDir(route)) {
    const p = Path.join(route, file.name);
    if (file.isDirectory) {
      yield* ReadDirectory(p);
    } else {
      yield p;
    }
  }
}

export async function* GetAllTpe(pages_route: string) {
  for await (const file of ReadDirectory(pages_route)) {
    if (!file.endsWith(".tpe")) {
      continue;
    }

    let url = Path.relative(pages_route, file)
      .replace(".tpe", "")
      .replace(/\\/gm, "/");
    if (url.startsWith(".")) {
      url = url.replace(".", "");
    }

    if (!url.startsWith("/")) {
      url = "/" + url;
    }

    url = url.replace(/\/index/gm, "");
    const local_path = Path.resolve(file);
    yield {
      path: url,
      text: await Deno.readTextFile(local_path),
      local_path,
    };
  }
}

export async function GetCompiledApp(path: string) {
  const json = JSON.parse(await Deno.readTextFile(path));
  Assert(IsPagesModel, json);
  return json;
}

export async function WriteCompiledApp(path: string, app: PagesModel) {
  await Deno.writeTextFile(path, JSON.stringify(app));
}

export async function GetOptions(path: string): Promise<Options> {
  if (await Exists(path)) {
    const json = JSON.parse(await Deno.readTextFile(path));
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
  };
}
