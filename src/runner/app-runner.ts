import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { PassThrough } from "stream";
import axios from "axios";
import { ParseUrl, RemoveUrlParameters } from "../utils/url";
import { Options } from "../file-system";
import { PagesModel } from "../compiler/page-builder";
import { EvaluateAsync } from "../utils/evaluate";
import { BuildPage } from "./page-builder";

function ServeAsStatic(content: string, content_type: string) {
  return (req: Request, res: Response) => {
    const fileContents = Buffer.from(content, "utf-8");

    const readStream = new PassThrough();
    readStream.end(fileContents);

    res.set("Content-Type", content_type);
    res.set("Cache-Control", "public");

    readStream.pipe(res);
  };
}
export async function StartApp(resources: PagesModel, options: Options) {
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  if (options.external_css) {
    resources.css_bundle = options.external_css
      .reverse()
      .reduce((c, n) => n + (c ?? ""), resources.css_bundle);
  }

  if (options.external_scripts) {
    resources.js_bundle = options.external_scripts
      .reverse()
      .reduce((c, n) => n + (c ?? ""), resources.js_bundle);
  }

  async function RenderPage(
    page: PagesModel["pages"][number],
    req: Request,
    res: Response
  ) {
    const handler = page.model.server_js[req.method.toLowerCase()];
    if (!handler) {
      res.status(404).end();
      return;
    }

    try {
      const query = { ...req.params, ...req.query };
      const body = { ...req.body };
      const props = await EvaluateAsync(handler, [
        { name: "query", value: query },
        { name: "body", value: body },
        { name: "context", value: { axios, ...resources } },
      ]);

      const html = BuildPage(
        page,
        resources.js_bundle,
        resources.css_bundle,
        props,
        options
      );

      res.set("Content-Type", "text/html");
      res.status(200).send(html).end();
    } catch (e) {
      console.log(`Error rendering ${page.url} see below`);
      console.error(e);
      res.status(500).end();
      return;
    }
  }

  if (options.static) {
    console.log(`Serving static directory at ${options.static}`);
    app.use("/_", express.static(options.static));
  }

  if (resources.js_bundle) {
    console.log(`Serving common js at /js/common.bundle.js`);
    app.get(
      "/js/common.bundle.js",
      ServeAsStatic(resources.js_bundle, "text/javascript")
    );
  }

  if (resources.css_bundle) {
    console.log(`Serving common css at /css/index.bundle.css`);
    app.get(
      "/css/index.bundle.css",
      ServeAsStatic(resources.css_bundle, "text/css")
    );
  }

  for (const page of resources.pages) {
    if (page.model.client_js) {
      console.log(`Serving /js${RemoveUrlParameters(page.url)}.js`);
      app.get(
        RemoveUrlParameters(`/js${page.url}.js`),
        ServeAsStatic(page.model.client_js, "text/javascript")
      );
    }

    if (page.model.css) {
      console.log(`Serving /css${RemoveUrlParameters(page.url)}.css`);
      app.get(
        RemoveUrlParameters(`/css${page.url}.css`),
        ServeAsStatic(page.model.css, "text/css")
      );
    }

    console.log(`Serving ${page.url}`);
    app.use(ParseUrl(page.url), (req, res) => RenderPage(page, req, res));
  }

  const server = app.listen(options.port ?? 3000, () => {
    console.log("Listening on port " + (options.port ?? 3000));
  });

  return {
    stop: () => server.close(),
  };
}
