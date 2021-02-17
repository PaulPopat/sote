# SOTE (Static Only Templating Engine)

This is a pre-existing framework built for node that you can see the docs for [here](https://docs.sote-framework.tech/). Please excuse the terrible styling, it is on the TODO list.

I have been moving over to Deno as a general rule lately and wanted to make the new home for this framework here. Longside that, I am making a couple of choice upgrades.

- Components will now only use a single colon to split the paths
- Sass is no longer available as there is not an actively maintain sass or equivalent compiler in Deno
- PostCSS is also no longer available. There is a package for this but it is not currently building on my machine.
  - The offset this, I am working on allowing JavaScript expressions in the CSS.

## Using the framework

This is still being set up so I will not fully document it here but you should be able to get it working using the docs linked above and these instructions.

- Use `deno run --unstable --allow-read --allow-write https://deno.land/x/sote/initialise.ts` to create a new project.
- Use `deno run --unstable --allow-read --allow-write https://deno.land/x/sote/build.ts` to build a project.
- Use `deno run --unstable --allow-read --allow-net https://deno.land/x/sote/start.ts` to run a project that you have built.

## What is being worked on?

Before I have considered this project an actual replacement for the NodeJs one, a couple of things need to happen.

- Some kind of programmatic styling must be supported.
- The project must be tested on a live system (the docs site will be guiney pig).
- The VSCode extension must syntax highlight for the new systems.
- The documentation site must be updated to match the changes.
- The documentation site must look it was made by a competent designer.