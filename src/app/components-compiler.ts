import { ReadDirectory } from "../utils/file-system";
import fs from "fs-extra";
import { CompileSass } from "./sass-compiler";
import { v4 } from "uuid";
import { AddCssSpecifier } from "./tpe-manipulator";
import { CompileCss } from "./css-manipulator";
import { ComponentsDir } from "../utils/options-parser";
import { IsString } from "@paulpopat/safe-type";

export type Components = { [key: string]: { tpe: string; css: string } };

export async function CompileComponents(
  inputroutes: ComponentsDir,
  quick: boolean
) {
  const components: Components = {};
  for (const c of inputroutes) {
    const route = IsString(c) ? c : c.path;
    const routes = await ReadDirectory(route);

    for (const r of routes.filter((r) => r.endsWith(".tpe"))) {
      const css = await (async () => {
        const route = r.replace(".tpe", ".scss");
        if (!(await fs.pathExists(route))) {
          return "";
        }

        return await CompileSass(route, quick);
      })();
      const name = r
        .replace(route, "")
        .slice(1)
        .replace(/[\/\\]/g, "-")
        .replace(".tpe", "");
      const final_name = IsString(c) ? name : c.prefix + "-" + name;
      const result = await fs.readFile(r, "utf-8");
      if (css) {
        const id = v4();
        components[final_name] = {
          tpe: AddCssSpecifier(result, id),
          css: CompileCss(css, id),
        };
      } else {
        components[final_name] = { tpe: result, css: "" };
      }
    }
  }

  return components;
}
