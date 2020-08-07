import chokidar from "chokidar";
import {
  GetOptions,
  GetAllTpe,
  WriteCompiledApp,
  Options,
} from "./file-system";
import { Debounce } from "./utils/debounce";
import { CompileApp } from "./compiler/page-builder";
import { IsString } from "@paulpopat/safe-type";
import { InitialiseApp } from "./file-system/initialiser";
import { StartApp } from "./runner/app-runner";

const command = (process.argv.find(
  (a) => a === "dev" || a === "build" || a === "start" || a === "init"
) ?? "dev") as "dev" | "build" | "start" | "init";

(async () => {
  switch (command) {
    case "dev": {
      let running = false;
      const run = Debounce(async () => {
        if (running) {
          return;
        }

        running = true;
        console.log("Compiling app and running.");
        const options = await GetOptions();
        await BuildApp(options, false);
        running = false;
      }, 200);

      chokidar
        .watch(["./**/*.tpe", "./tpe-config.json"], {
          ignored: ["node_modules**/*"],
        })
        .on("all", run);
      break;
    }
    case "build": {
      console.log("Building a production version of the app.");
      const options = await GetOptions();
      await BuildApp(options, true);
      break;
    }
    case "init": {
      await InitialiseApp();
      break;
    }
    case "start": {
      const options = await GetOptions();
      await StartApp(options);
      break;
    }
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});

async function BuildApp(options: Options, production: boolean) {
  const components = await GetComponents(options);
  const pages = await GetAllTpe(options.pages ?? "./src/pages");
  const compiled = await CompileApp(pages, components, production);
  await WriteCompiledApp(compiled);
}

async function GetComponents(options: Options) {
  if (!options.components) {
    return [];
  }

  return (
    await Promise.all(
      options.components?.map(async (components_dir) =>
        IsString(components_dir)
          ? await GetAllTpe(components_dir)
          : (await GetAllTpe(components_dir.path)).map((c) => ({
              ...c,
              path: "/" + components_dir.prefix + c.path,
            }))
      )
    )
  ).flatMap((f) => f);
}
