import { v4 } from "https://deno.land/std@0.87.0/uuid/mod.ts";
import * as Path from "https://deno.land/std/path/mod.ts";

export async function TransformJs(js: string, working_dir: string) {
  const path = Path.join(working_dir, v4.generate() + ".js");
  await Deno.writeTextFile(path, js + "\nexport default undefined;");

  try {
    const { files, diagnostics } = await Deno.emit(path, { bundle: "esm" });
    if (diagnostics.length > 0) {
      for (const diag of diagnostics) {
        console.error(diag);
      }

      throw new Error("Compiling JavaScript failed. See error above.");
    }

    return files["deno:///bundle.js"].replace(/\nexport { undefined as default };\n/gm, "");
  } finally {
    await Deno.remove(path);
  }
}
