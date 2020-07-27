import { ReadDirectory } from "../utils/file-system";
import fs from "fs-extra";
import sass from "node-sass";
import { CompileSass } from "./sass-compiler";
import { v4 } from "uuid";
import { AddCssSpecifier } from "./tpe-manipulator";
import { CompileCss } from "./css-manipulator";

export type Components = { [key: string]: { tpe: string; css: string } };

export async function CompileComponents(inputroutes: string[], quick: boolean) {
  const components: Components = {};
  for (const route of inputroutes) {
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
      const result = await fs.readFile(r, "utf-8");
      if (css) {
        const id = v4();
        components[name] = {
          tpe: AddCssSpecifier(result, id),
          css: CompileCss(css, id),
        };
      } else {
        components[name] = { tpe: result, css: "" };
      }
    }
  }

  return components;
}
