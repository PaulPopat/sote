import chokidar from "chokidar";
import {
  GetOptions,
  GetAllTpe,
  WriteCompiledApp,
  Options,
  GetCompiledApp,
  GetSassVariables,
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
        await app?.stop();
        console.log("Compiling app and running.");
        const options = await GetOptions("./tpe-config.json");
        console.log("Got options and starting the build.");
        const compiled = await BuildApp(options, false, false);
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
      .watch(["./**/*.tpe", "./tpe-config.json", "./**/*.js", "./**/*.scss"], {
        ignored: ["node_modules/**/*", ".git/**/*", ".sote/**/*"],
      })
      .on("all", run);
  } else if (command === "build") {
    console.log("Building a production version of the app.");
    const options = await GetOptions("./tpe-config.json");
    await BuildApp(options, true, true);
  } else if (command === "init") {
    await InitialiseApp();
  } else if (command === "start") {
    console.log("Running the production version of the app.");
    const options = await GetOptions("./tpe-config.json");
    await StartApp(await GetCompiledApp("./.sote/app.json"), options);
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});

export async function GetComponents(options: Options) {
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

export async function BuildApp(
  options: Options,
  production: boolean,
  write: boolean
) {
  if (options.google_tracking_id) {
    console.log(
      [
        "You are using Google Analytics.",
        "Please make sure you have a valid cookie notice on your site.",
        "Google analytics are disabled by default.",
        "Use window.GAEnabled to check if it is active in the client JS.",
        "Use window.EnableGA to enable it on client JS.",
      ].join(" ")
    );
  }

  const components = await GetComponents(options);
  const pages = await GetAllTpe(options.pages ?? "./src/pages");
  const compiled = await CompileApp(
    pages,
    components,
    await GetSassVariables(options),
    production
  );
  if (write) {
    await WriteCompiledApp("./.sote/app.json", compiled);
  }

  return compiled;
}
