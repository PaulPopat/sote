import { ReadDirectory } from "./utils/file-system";
import fs from "fs-extra";
import { IsProduction } from "./utils/environment";

let componentscache: { [key: string]: string } = {};

export async function GetAllComponent(route: string) {
  const routes = await ReadDirectory(route);
  if (componentscache) {
    return componentscache;
  }

  const components: { [key: string]: string } = {};
  for (const route of routes.filter((r) => r.endsWith(".tpe"))) {
    const name = route
      .replace(route, "")
      .slice(1)
      .replace(/[\/\\]/g, "-")
      .replace(".tpe", "");
    components[name] = await fs.readFile(route, "utf-8");
  }

  if (IsProduction) {
    componentscache = components;
  }

  return components;
}
