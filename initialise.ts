console.log("Preparing a starting app for you");
await Deno.writeTextFile(
  "./tpe-config.json",
  JSON.stringify(
    {
      static: "./_",
      pages: "./src/pages",
      components: [{ path: "./src/components", prefix: "c" }],
      lang: "en",
      port: 3000,
      behavior_in_tag: false,
      email: false,
      author: "",
      favicon: [],
    },
    undefined,
    2
  )
);

await Deno.mkdir("./src");
await Deno.mkdir("./src/pages");
await Deno.mkdir("./src/components");

await Deno.writeTextFile(
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
`
);

await Deno.writeTextFile(
  "./src/pages/index.tpe",
  `<title>This is a test page</title>
<description>This the description of a test page</description>
<template>
<c:header>Hello world</c:header>
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
`
);

await Deno.mkdir("./_");
