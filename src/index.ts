import chokidar from "chokidar";
import {
  GetOptions,
  GetAllTpe,
  WriteCompiledApp,
  Options,
  GetCompiledApp,
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
  if (command === "dev") {
    let running = false;
    let app: any;
    const run = Debounce(async () => {
      try {
        if (running) {
          return;
        }

        running = true;
        app?.stop();
        console.log("Compiling app and running.");
        const options = await GetOptions();
        console.log("Got options and starting the build.");
        const compiled = await BuildApp(options, false);
        console.log("Finished building the app. Starting it up.");
        app = await StartApp(compiled, options);
        running = false;
      } catch (e) {
        console.log(
          "Compile failed. See error below. This will have stopped the app and you will need to run the build again."
        );
        console.error(e);
      }
    }, 200);

    chokidar
      .watch(["./**/*.tpe", "./tpe-config.json"], {
        ignored: ["node_modules/**/*", ".git/**/*", ".sote/**/*"],
      })
      .on("all", run);
  } else if (command === "build") {
    console.log("Building a production version of the app.");
    const options = await GetOptions();
    await BuildApp(options, true);
  } else if (command === "init") {
    await InitialiseApp();
  } else if (command === "start") {
    console.log("Running the production version of the app.");
    const options = await GetOptions();
    await StartApp(await GetCompiledApp(), options);
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});

async function BuildApp(options: Options, production: boolean) {
  if (options.google_tracking_id) {
    console.log(
      `You are using Google Analytics. Please make sure you have a valid cookie notice on your site.`
    );
  }

  const components = await GetComponents(options);
  const pages = await GetAllTpe(options.pages ?? "./src/pages");
  const compiled = await CompileApp(pages, components, production);
  await WriteCompiledApp(compiled);
  return compiled;
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
