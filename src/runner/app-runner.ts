import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { PassThrough } from "stream";
import { v4 as uuid } from "uuid";
import cookieParser from "cookie-parser";
import { ParseUrl, RemoveUrlParameters } from "../utils/url";
import { Options } from "../file-system/index";
import { PagesModel } from "../compiler/page-builder";
import { EvaluateAsync } from "../utils/evaluate";
import { BuildPage } from "./page-builder";
import path from "path";

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
  app.use(cookieParser());

  const context_data = options.resources
    ? { ...require(path.resolve(options.resources)) }
    : {};

  function PageRenderer(page: PagesModel["pages"][number]) {
    const cached_responses: NodeJS.Dict<{
      timeout: NodeJS.Timeout;
      props: any;
    }> = {};
    return async (req: Request, res: Response) => {
      const handler = page.model.server_js[req.method.toLowerCase()];
      if (!handler) {
        res.status(404).end();
        return;
      }

      try {
        const props = await (async () => {
          const redirectId = req.cookies["redirect-id"];
          const cached = cached_responses[redirectId ?? ""];
          if (cached) {
            clearTimeout(cached.timeout);
            const props = cached.props;
            cached_responses[req.cookies["redirect-id"]] = undefined;
            res.cookie("redirect-id", "", { expires: new Date() });
            return props;
          }

          const query = { ...req.params, ...req.query };
          const body = { ...req.body };
          return await EvaluateAsync(handler, [
            { name: "query", value: query },
            { name: "body", value: body },
            { name: "context", value: context_data },
            { name: "req", value: req },
            { name: "res", value: res },
          ]);
        })();

        if (req.method.toLowerCase() !== "get") {
          const redirectId = uuid();
          cached_responses[redirectId] = {
            props,
            timeout: setTimeout(() => {
              cached_responses[redirectId] = undefined;
            }, 60 * 1000),
          };
          res.cookie("redirect-id", redirectId, { maxAge: 60 * 1000 });
          res.redirect(303, req.url);
          return;
        }

        const html = await BuildPage(
          page,
          resources.components,
          resources.js_bundle,
          resources.css_bundle,
          props,
          context_data,
          options,
          req.cookies["track-ga"]
        );

        res.set("Content-Type", "text/html");
        res.status(200).send(html).end();
      } catch (e) {
        console.log(`Error rendering ${page.url} see below`);
        console.error(e);
        res.status(500).end();
        return;
      }
    };
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

    console.log(`Serving ${page.url || "/"}`);
    app.all(ParseUrl(page.url) || "/", PageRenderer(page));
  }

  const server = app.listen(options.port ?? 3000, () => {
    console.log("Listening on port " + (options.port ?? 3000));
  });

  return {
    stop: () => server.close(),
  };
}
