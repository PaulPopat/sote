import { Options } from "./utils/options-parser";
import fs from "fs-extra";
import { GetAllComponent } from "./component";
import { ReadDirectory } from "./utils/file-system";
import { spawn } from "child_process";
import path from "path";
import { JSDOM } from "jsdom";
import { CreateElementsFromHTML } from "./utils/html";
import browserify from "browserify";
import factor from "factor-bundle";
import sass from "node-sass";
import { Routes } from "./app/routes";
import { IsObject, IsString, IsType } from "@paulpopat/safe-type";

const isWin = process.platform === "win32";

export const IsPageJson = IsObject({
  server_js_path: IsString,
  page_js_path: IsString,
  tpe_data: IsString,
  url: IsString,
});

type PageJson = IsType<typeof IsPageJson>;

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
    const path = isWin ? "tsc.cmd" : "tsc";
    const p = spawn(path);
    let output: string[] = [];

    p.stderr.on("data", (data) => {
      output = [...output, `stderr: ${data}`];
    });

    p.stdout.on("data", (data) => {
      output = [...output, `stdout: ${data}`];
    });

    p.on("exit", (c) => {
      if (c !== 0) {
        console.log("TS compile failed. See output below");
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
}

async function CompileTpe(route: string, options: Options) {
  const base = await fs.readFile(route, "utf-8");
  const layout = await options.GetLayout();
  const dom = new JSDOM(layout);
  if (options.sass) {
    const sass_e = dom.window.document.createElement("link");
    sass_e.rel = "stylesheet";
    sass_e.type = "text/css";
    sass_e.href = "/css/index.css";
    dom.window.document.head.append(sass_e);
  }

  dom.window.document
    .querySelector("BODY_CONTENT")
    ?.replaceWith(...CreateElementsFromHTML(dom.window.document, base));
  return dom;
}

async function GetTypeData(
  page: string,
  options: Options,
  url: string,
  has_bundle: boolean
) {
  const dom = await CompileTpe(page, options);

  if (has_bundle) {
    const bundle_e = dom.window.document.createElement("script");
    bundle_e.src = "/js/common.bundle.js";
    dom.window.document.body.append(bundle_e);
    const page_e = dom.window.document.createElement("script");
    page_e.src = `/js${url}`;
    dom.window.document.body.append(page_e);
  }

  return dom.serialize();
}

async function CompileSass(index_path: string) {
  const css = await new Promise<string>((res, rej) => {
    sass.render({ file: index_path }, (err, r) => {
      if (err) {
        rej(err);
      } else {
        res(r.css.toString("utf-8"));
      }
    });
  });

  await fs.writeFile(Routes.sass, css);
}

async function EnsureJsPath(jspath: string) {
  if (!(await fs.pathExists(jspath))) {
    await fs.writeFile(
      jspath,
      `module.exports = {
        get: async () => ({
          status: 200,
          data: {},
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

export async function Compile(options: Options, quick: boolean) {
  const components = await GetAllComponent(options.components);
  await fs.outputJson(Routes.components, components);
  const pages_dir = await ReadDirectory(options.pages);
  await CompileTypescript();
  await CompilePages();
  if (options.sass) {
    await CompileSass(options.sass);
  }

  let pages_json: PageJson[] = [];
  for (const page of pages_dir
    .filter((d) => d.endsWith(".tpe"))
    .filter((d) => !d.endsWith("_error.tpe"))) {
    const jspath = path.join(Routes.compiled_js, page.replace(".tpe", ".js"));
    await EnsureJsPath(jspath);

    const url = GetPathUrl(page, options);
    pages_json = [
      ...pages_json,
      {
        tpe_data: await GetTypeData(
          page,
          options,
          url,
          await fs.pathExists(jspath.replace(".js", ".bundle.js"))
        ),
        server_js_path: jspath,
        page_js_path: jspath.replace(".js", ".bundle.js"),
        url,
      },
    ];
  }

  const error = await CompileTpe(options.error_page, options);
  await fs.outputFile(Routes.error, error.serialize(), "utf-8");
  await fs.outputJson(Routes.pages, pages_json);
}
