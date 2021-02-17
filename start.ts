import { GetOptions, GetCompiledApp } from "./file-system.ts";
import { StartApp } from "./runner/app-runner.ts";

console.log("Starting the app.");
const options = await GetOptions("./tpe-config.json");
await StartApp(await GetCompiledApp("./.sote/app.json"), options);
