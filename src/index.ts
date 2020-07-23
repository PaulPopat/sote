import { GetOptions } from "./utils/options-parser";
import { Compile } from "./code-compiler";
import { StartApp } from "./app-runner";

(async () => {
  const options = await GetOptions();
  await Compile(options, true);

  await StartApp(options);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
