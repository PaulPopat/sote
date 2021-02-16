import { v4 } from "https://deno.land/std@0.87.0/uuid/mod.ts";
import * as Path from "https://deno.land/std/path/mod.ts";

export async function TransformJs(js: string, working_dir: string) {
  const path = Path.join(working_dir, v4.generate() + ".js");
  await Deno.writeTextFile(path, js + "\nexport default undefined;");

  try {
    const [err, result] = await Deno.bundle(path, undefined, {
      module: "esnext",
      target: "es5",
      allowJs: true,
    });
    if (err) {
      throw err;
    }

    return result.replace(/\nexport default undefined;\n/gm, "");
  } finally {
    await Deno.remove(path);
  }
}
