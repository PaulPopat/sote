import { ReadDirectory } from "./utils/file-system";
import fs from "fs-extra";
import { IsProduction } from "./utils/environment";

let componentscache: { [key: string]: string };

export async function GetAllComponent(inputroutes: string[]) {
  const components: { [key: string]: string } = {};
  for (const route of inputroutes) {
    const routes = await ReadDirectory(route);
    if (componentscache) {
      return componentscache;
    }

    for (const r of routes.filter((r) => r.endsWith(".tpe"))) {
      const name = r
        .replace(route, "")
        .slice(1)
        .replace(/[\/\\]/g, "-")
        .replace(".tpe", "");
      components[name] = await fs.readFile(r, "utf-8");
    }
  }

  if (IsProduction) {
    componentscache = components;
  }

  return components;
}
