import { IsString } from "https://deno.land/x/safe_type@2.2.3/mod.ts";
import * as Fs from "./file-system.ts";
import { Options } from "./types/config.ts";
import { CompileApp } from "./compiler/page-builder.ts";

export async function* GetComponents(options: Options) {
  if (!options.components) {
    return [];
  }

  for (const dir of options.components) {
    if (IsString(dir)) {
      yield* Fs.GetAllTpe(dir);
    } else {
      for await (const tpe of Fs.GetAllTpe(dir.path)) {
        yield {
          ...tpe,
          path: "/" + dir.prefix + tpe.path,
        };
      }
    }
  }
}

export async function BuildApp(options: Options, write: boolean) {
  if (options.google_tracking_id) {
    console.log(
      [
        "You are using Google Analytics.",
        "Please make sure you have a valid cookie notice on your site.",
        "Google analytics are disabled by default.",
        "Use window.GAEnabled to check if it is active in the client JS.",
        "Use window.EnableGA to enable it on client JS.",
      ].join(" ")
    );
  }

  const components = GetComponents(options);
  const pages = Fs.GetAllTpe(options.pages ?? "./src/pages");
  const compiled = await CompileApp(pages, components);
  if (write) {
    await Fs.WriteCompiledApp("./.sote/app.json", compiled);
  }

  return compiled;
}

const options = await Fs.GetOptions("./tpe-config.json");
BuildApp(options, true);
