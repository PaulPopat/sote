import { GetOptions } from "./utils/options-parser";
import { Compile } from "./code-compiler";
import { StartApp, Server } from "./app-runner";
import chokidar from "chokidar";
import { Debounce } from "./utils/debounce";

(async () => {
  const options = await GetOptions();
  if (options.mode === "dev") {
    console.log("Starting in dev mode so watching for changes.");
    let server: Server | undefined;
    console.log("Watching for changes.");
    const run = Debounce(async () => {
      console.log("Detected a change. Compiling and running again.");
      server?.stop();
      await Compile(options, true);
      server = await StartApp(options);
    }, 200);
    chokidar
      .watch(
        ["./**/*.ts", "./**/*.tpe", "./tpe-config.json", "./tsconfig.json"],
        {
          ignored: ["node_modules/**/*", ".git/**/*", ".sote/**/*"],
        }
      )
      .on("all", run);
  } else if (options.mode === "build") {
    await Compile(options, false);
  } else {
    await StartApp(options);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
