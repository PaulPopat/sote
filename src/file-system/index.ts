import fs from "fs-extra";
import path from "path";

export async function ReadDirectory(route: string): Promise<string[]> {
  const result: string[] = [];
  const files = await fs.readdir(route);
  for (const file of files) {
    const p = path.join(route, file);
    const stats = await fs.stat(p);
    if (stats.isDirectory()) {
      result.push(...(await ReadDirectory(p)));
    } else {
      result.push(p);
    }
  }

  return result;
}

export async function GetAllTpe(pages_route: string) {
  const files = await ReadDirectory(pages_route);
  return await Promise.all(
    files
      .filter((f) => f.endsWith(".tpe"))
      .map(async (f) => {
        let url = path.relative(pages_route, f).replace("\\", "/");
        if (url.startsWith(".")) {
          url.replace(".", "");
        }

        if (!url.startsWith("/")) {
          url = "/" + url;
        }

        url = url.replace(/\/index/gm, "");

        return {
          path: url,
          text: await fs.readFile(path.resolve(f), "utf-8"),
        };
      })
  );
}
