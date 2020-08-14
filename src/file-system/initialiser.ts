import fs from "fs-extra";

export async function InitialiseApp() {
  console.log("Preparing a starting app for you");
  await fs.outputJson("./tpe-config.json", {
    static: "./_",
    pages: "./src/pages",
    components: [{ path: "./src/components", prefix: "c" }],
    lang: "en",
    port: 3000,
    behavior_in_tag: false,
    external_scripts: [],
    external_css: []
  });

  await fs.outputFile(
    "./src/components/header.tpe",
    `<template>
  <h1><children></children></h1>
</template>
<style>
  /* This is optional */
</style>
<script area="client">
  // This is optional
</script>
`,
    "utf-8"
  );

  await fs.outputFile(
    "./src/pages/index.tpe",
    `<title>This is a test page</title>
<description>This the description of a test page</description>
<template>
  <c::header>Hello world</c::header>
</template>
<style>
  /* This is optional */
</style>
<script area="client">
  // This is optional
</script>
<script area="server" method="get">
  // This equivalent will be added if not included in the file
  return query;
</script>
`,
    "utf-8"
  );

  await fs.mkdir("./_");
}
