import { ReadDirectory } from "./utils/file-system";
import fs from "fs-extra";

export async function GetAllComponent(inputroutes: string[]) {
  const components: { [key: string]: string } = {};
  for (const route of inputroutes) {
    const routes = await ReadDirectory(route);

    for (const r of routes.filter((r) => r.endsWith(".tpe"))) {
      const name = r
        .replace(route, "")
        .slice(1)
        .replace(/[\/\\]/g, "-")
        .replace(".tpe", "");
      components[name] = await fs.readFile(r, "utf-8");
    }
  }

  return components;
}
