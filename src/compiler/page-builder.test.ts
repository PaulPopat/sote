import { CompileApp } from "./page-builder";

it("Compiles a basic page", () => {
  expect(
    CompileApp(
      [
        {
          path: "/test",
          text: `
<template>
  <div />
</template>
<title>A test page</title>
<description>A test description</description>`,
        },
      ],
      [],
      false
    )
  ).toMatchSnapshot();
});

it("Compiles client javascript", () => {
  expect(
    CompileApp(
      [
        {
          path: "/test",
          text: `
<template>
  <div />
</template>
<script area="client">
  console.log("Hello world")
</script>
<title>A test page</title>
<description>A test description</description>`,
        },
      ],
      [],
      false
    )
  ).toMatchSnapshot();
});

it("Minifies client js for production", () => {
  expect(
    CompileApp(
      [
        {
          path: "/test",
          text: `
<template>
  <div />
</template>
<script area="client">
  function thing() {
    console.log("hello world")
  }
</script>
<title>A test page</title>
<description>A test description</description>`,
        },
      ],
      [],
      true
    )
  ).toMatchSnapshot();
});

it("Compiles server get js", () => {
  expect(
    CompileApp(
      [
        {
          path: "/test",
          text: `
<template>
  <div />
</template>
<script area="server">
  console.log("Hello world");
  return {};
</script>
<title>A test page</title>
<description>A test description</description>`,
        },
      ],
      [],
      false
    )
  ).toMatchSnapshot();
});

it("Compiles method js for server", () => {
  expect(
    CompileApp(
      [
        {
          path: "/test",
          text: `
<template>
  <div />
</template>
<script area="server" method="post">
  console.log("Hello world");
  return {};
</script>
<title>A test page</title>
<description>A test description</description>`,
        },
      ],
      [],
      false
    )
  ).toMatchSnapshot();
});

it("Compiles page css", () => {
  expect(
    CompileApp(
      [
        {
          path: "/test",
          text: `
<template>
  <div />
</template>
<style>
  .test { display: block; }
</style>
<title>A test page</title>
<description>A test description</description>`,
        },
      ],
      [],
      false
    )
  ).toMatchSnapshot();
});

it("Bundles component css", () => {
  expect(
    CompileApp(
      [
        {
          path: "/test",
          text: `
<template>
  <test::component>
    <div />
  </test::component>
</template>
<style>
  .test { display: block; }
</style>
<title>A test page</title>
<description>A test description</description>`,
        },
      ],
      [
        {
          path: "/test/component",
          text: `
<template>
  <div>
    <children />
  </div>
</template>
<style>
  div { display: block; }
</style>
        `,
        },
      ],
      false
    )
  ).toMatchSnapshot();
});

it("Bundles component javascript", () => {
  expect(
    CompileApp(
      [
        {
          path: "/test",
          text: `
<template>
  <test::component>
    <div />
  </test::component>
</template>
<style>
  .test { display: block; }
</style>
<title>A test page</title>
<description>A test description</description>`,
        },
      ],
      [
        {
          path: "/test/component",
          text: `
<template>
  <div>
    <children />
  </div>
</template>
<script area="client">
  console.log("Hello world");
</script>
        `,
        },
      ],
      false
    )
  ).toMatchSnapshot();
});

it("Does not bundle css if the component is not always used", () => {
  expect(
    CompileApp(
      [
        {
          path: "/test",
          text: `
<template>
  <test::component>
    <div />
  </test::component>
</template>
<style>
  .test { display: block; }
</style>
<title>A test page</title>
<description>A test description</description>`,
        },
        {
          path: "/test",
          text: `
<template>
  <div />
</template>
<style>
  .test { display: block; }
</style>
<title>A test page</title>
<description>A test description</description>`,
        },
      ],
      [
        {
          path: "/test/component",
          text: `
<template>
  <div>
    <children />
  </div>
</template>
<style>
  div { display: block; }
</style>
        `,
        },
      ],
      false
    )
  ).toMatchSnapshot();
});

it("Bundles component javascript", () => {
  expect(
    CompileApp(
      [
        {
          path: "/test",
          text: `
<template>
  <test::component>
    <div />
  </test::component>
</template>
<style>
  .test { display: block; }
</style>
<title>A test page</title>
<description>A test description</description>`,
        },
        {
          path: "/test",
          text: `
<template>
  <div />
</template>
<style>
  .test { display: block; }
</style>
<title>A test page</title>
<description>A test description</description>`,
        },
      ],
      [
        {
          path: "/test/component",
          text: `
<template>
  <div>
    <children />
  </div>
</template>
<script area="client">
  console.log("Hello world");
</script>
        `,
        },
      ],
      false
    )
  ).toMatchSnapshot();
});