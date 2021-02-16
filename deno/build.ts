import { IsString } from "https://deno.land/x/safe_type@2.2.3/mod.ts";
import * as Fs from "./file-system/index.ts";
import { Options } from "./types/config.ts";

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
