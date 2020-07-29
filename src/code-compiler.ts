import { Options } from "./utils/options-parser";
import fs from "fs-extra";
import { ReadDirectory } from "./utils/file-system";
import { spawn } from "child_process";
import path from "path";
import { JSDOM } from "jsdom";
import { CreateElementsFromHTML } from "./utils/html";
import browserify from "browserify";
import factor from "factor-bundle";
import { Routes } from "./app/routes";
import { IsObject, IsString, IsType } from "@paulpopat/safe-type";
import Uglify from "uglify-js";
import { CompileComponents, Components } from "./app/components-compiler";
import { CompileSass } from "./app/sass-compiler";
import { CompileTpe } from "./app/tpe-compiler";
import { ChunkCss } from "./app/chunk-css";

const isWin = process.platform === "win32";

export const IsPageJson = IsObject({
  server_js_path: IsString,
  page_js_path: IsString,
  css_path: IsString,
  tpe_data: IsString,
  url: IsString,
});

type PageJson = IsType<typeof IsPageJson>;

export async function Compile(options: Options, quick: boolean) {
  const components = await CompileComponents(options.components, quick);
  const componentsDictionary = Object.keys(components).reduce(
    (c, n) => ({ ...c, [n]: components[n].tpe }),
    {} as NodeJS.Dict<string>
  );
  const pages_dir = await ReadDirectory(options.pages);

  async function CompileTypescript() {
    if (!(await fs.pathExists("./tsconfig.json"))) {
      console.log("No TSConfig found so populating with default values");
      await fs.outputJson("./tsconfig.json", {
        compilerOptions: {
          strict: true,
          esModuleInterop: true,
          moduleResolution: "node",
          rootDir: ".",
          outDir: Routes.compiled_js,
        },
      });
    }

    return await new Promise<void>((res, rej) => {
      const command = isWin
        ? path.resolve("node_modules/.bin/tsc.cmd")
        : path.resolve("node_modules/.bin/tsc");
      const p = spawn(command);
      let output: string[] = [];

      p.stderr.on("data", (data) => {
        output = [...output, `stderr: ${data}`];
      });

      p.stdout.on("data", (data) => {
        output = [...output, `stdout: ${data}`];
      });

      p.on("exit", (c) => {
        if (c !== 0) {
          console.log(
            "TS compile failed. See output below. Make sure that you have TypeScript installed locally if this SOTE is installed globally."
          );
          console.log(output.join("\n"));
          rej(c);
        } else {
          res();
        }
      });
    });
  }

  async function CompilePages() {
    const pages = (await ReadDirectory(Routes.compiled_js)).filter((p) =>
      p.endsWith(".page.js")
    );
    browserify({
      entries: pages,
    })
      .plugin(factor, {
        o: pages.map((p) => p.replace(".page.js", ".bundle.js")),
      })
      .bundle()
      .pipe(fs.createWriteStream(Routes.common_js));
    if (!quick) {
      const bundles = (await ReadDirectory(Routes.compiled_js)).filter((p) =>
        p.endsWith(".bundle.js")
      );
      for (const bundle of bundles) {
        await fs.outputFile(
          bundle,
          Uglify.minify(await fs.readFile(bundle, "utf-8")),
          "utf-8"
        );
      }
    }
  }

  async function CompileTpeInt(route: string) {
    const base = await fs.readFile(route, "utf-8");
    const layout = await options.GetLayout();
    const compiled = CompileTpe(layout, base, componentsDictionary);
    const dom = new JSDOM(compiled.template);

    dom.window.document
      .querySelector("BODY_CONTENT")
      ?.replaceWith(...CreateElementsFromHTML(dom.window.document, base));
    return { dom, components: compiled.components };
  }

  async function GetPageCss(
    options: Options,
    components_used: string[],
    route: string
  ) {
    let result = "";
    if (options.sass) {
      result += await CompileSass(options.sass, quick);
    }

    if (await fs.pathExists(route.replace(".tpe", ".scss"))) {
      result += await CompileSass(route.replace(".tpe", ".scss"), quick);
    }

    for (const key of components_used) {
      const component = components[key];
      if (!component || !component.css) {
        continue;
      }

      result += component.css;
    }

    return result;
  }

  async function GetTypeData(page: string, url: string, has_bundle: boolean) {
    const { dom, components: components_used } = await CompileTpeInt(page);

    if (has_bundle) {
      const bundle_e = dom.window.document.createElement("script");
      bundle_e.src = "/js/common.bundle.js";
      dom.window.document.body.append(bundle_e);
      const page_e = dom.window.document.createElement("script");
      page_e.src = `/js${url === "/" ? "" : url}`;
      dom.window.document.body.append(page_e);
    }

    if (options.sass || components_used.length) {
      const sass_e = dom.window.document.createElement("link");
      sass_e.rel = "stylesheet";
      sass_e.type = "text/css";
      sass_e.href = "/css/index.css";
      dom.window.document.head.append(sass_e);

      const page_sass_e = dom.window.document.createElement("link");
      page_sass_e.rel = "stylesheet";
      page_sass_e.type = "text/css";
      page_sass_e.href = `/css/pages${url === "/" ? "" : url}`;
      dom.window.document.head.append(page_sass_e);
    }

    return {
      data: dom.serialize(),
      css: await GetPageCss(options, components_used, page),
    };
  }

  async function EnsureJsPath(jspath: string) {
    if (!(await fs.pathExists(jspath))) {
      await fs.outputFile(
        jspath,
        `module.exports = {
          get: async (query) => ({
            status: 200,
            data: query,
          })
        };`
      );
    }
  }

  function GetPathUrl(page: string, options: Options) {
    const result = page
      .replace(options.pages, "")
      .replace(/\\/g, "/")
      .replace(".tpe", "")
      .replace("/index", "");
    if (!result) {
      return "/";
    }

    return result;
  }

  await CompileTypescript();
  await CompilePages();

  let pages_json: PageJson[] = [];
  for (const page of pages_dir.filter((d) => d.endsWith(".tpe"))) {
    const jspath = path.join(Routes.compiled_js, page.replace(".tpe", ".js"));
    const csspath = path.join(
      Routes.compiled_css,
      page.replace(".tpe", ".css")
    );
    await EnsureJsPath(jspath);

    const url = GetPathUrl(page, options);
    const data = await GetTypeData(
      page,
      url,
      await fs.pathExists(jspath.replace(".js", ".bundle.js"))
    );

    if (data.css) {
      await fs.outputFile(csspath, data.css, "utf-8");
    }

    pages_json = [
      ...pages_json,
      {
        tpe_data: data.data,
        server_js_path: jspath,
        page_js_path: jspath.replace(".js", ".bundle.js"),
        url,
        css_path: csspath,
      },
    ];
  }

  if (await fs.pathExists(Routes.compiled_css)) {
    const css = await Promise.all(
      (await ReadDirectory(Routes.compiled_css)).map(async (p) => ({
        css: await fs.readFile(p, "utf-8"),
        name: p,
      }))
    );
    const analysed = ChunkCss(css);
    await fs.outputFile(Routes.sass, analysed.common);
    for (const file of analysed.files) {
      await fs.outputFile(file.name, file.css);
    }
  }

  await fs.outputJson(Routes.pages, pages_json);
}
