import fs from "fs-extra";
import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import path from "path";
import { Routes } from "./app/routes";
import { Assert, PromiseType } from "./utils/types";
import {
  IsArray,
  IsDictionary,
  IsString,
  IsObject,
  IsNumber,
  Optional,
  DoNotCare,
} from "@paulpopat/safe-type";
import { IsPageJson } from "./code-compiler";
import { Options } from "./utils/options-parser";
import TemplateParser from "./template-parser";
import { RemoveUrlParameters, ParseUrl } from "./utils/url";

const IsResponse = IsObject({
  status: IsNumber,
  headers: Optional(IsDictionary(IsString)),
  data: DoNotCare,
});

async function ServeIfExists(path: string, url: string, app: Express) {
  if (await fs.pathExists(path)) {
    console.log("Serving " + RemoveUrlParameters(url));
    app.use(RemoveUrlParameters(url), express.static(path));
  }
}

export async function StartApp(options: Options) {
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  const pages = await fs.readJson(Routes.pages);
  Assert(IsArray(IsPageJson), pages);

  await ServeIfExists(Routes.common_js, "/js/common.bundle.js", app);
  await ServeIfExists(Routes.sass, "/css/index.css", app);
  if (options.staticroute) {
    app.use("/_", express.static(options.staticroute));
  }

  const error_page = pages.find((p) => p.url === "/_error");
  if (!error_page) {
    throw new Error("No error page");
  }

  const error_imported = require(path.resolve(error_page.server_js_path));
  await ServeIfExists(
    error_page.page_js_path,
    `/js${error_page.url === "/" ? "" : error_page.url}`,
    app
  );
  await ServeIfExists(
    error_page.css_path,
    `/css/pages${error_page.url === "/" ? "" : error_page.url}`,
    app
  );
  const render_error = async (data: any, req: Request, res: Response) => {
    try {
      const result = await error_imported.get(data);
      Assert(IsResponse, result, "Invalid JSON response");
      const response = TemplateParser(error_page.tpe_data, result.data);

      for (const key in result.headers) {
        res.setHeader(key, result.headers[key]);
      }
      res.setHeader("Content-Type", "text/html; charset=UTF-8");
      res.status(result.status).send(response);
    } catch (e) {
      console.error(e);
      res.status(500).send("Internal server error");
    }
  };

  for (const page of pages) {
    await ServeIfExists(
      page.page_js_path,
      `/js${page.url === "/" ? "" : page.url}`,
      app
    );
    await ServeIfExists(
      page.css_path,
      `/css/pages${page.url === "/" ? "" : page.url}`,
      app
    );
    const imported = require(path.resolve(page.server_js_path));

    const HandleQueryType = (
      handler: (
        query: any,
        headers: NodeJS.Dict<string | string[]>
      ) => Promise<unknown>
    ) => {
      return async (req: Request, res: Response) => {
        console.log(`Handling ${req.method} for ${page.url}`);
        try {
          const query = { ...req.params, ...req.query };
          const result = await handler(query, req.headers);
          Assert(IsResponse, result, "Invalid JSON response");
          if (result.status > 399) {
            throw result.data;
          }

          const response = TemplateParser(page.tpe_data, result.data);

          for (const key in result.headers) {
            res.setHeader(key, result.headers[key]);
          }
          res.setHeader("Content-Type", "text/html; charset=UTF-8");
          res.status(result.status).send(response);
        } catch (e) {
          await render_error(e, req, res);
        }

        console.log(`Finished handling ${req.method} for ${page.url}`);
      };
    };

    const HandleBodyType = (
      handler: (
        query: any,
        body: any,
        headers: NodeJS.Dict<string | string[]>
      ) => Promise<unknown>
    ) => {
      return async (req: Request, res: Response) => {
        console.log(`Handling ${req.method} for ${page.url}`);
        try {
          const query = { ...req.params, ...req.query };
          const body = { ...req.body };
          const result = await handler(query, body, req.headers);
          Assert(IsResponse, result, "Invalid JSON response");
          if (result.status > 399) {
            throw result.data;
          }

          const response = TemplateParser(page.tpe_data, result.data);

          for (const key in result.headers) {
            res.setHeader(key, result.headers[key]);
          }
          res.setHeader("Content-Type", "text/html; charset=UTF-8");
          res.status(result.status).send(response);
        } catch (e) {
          await render_error(e, req, res);
        }

        console.log(`Finished handling ${req.method} for ${page.url}`);
      };
    };

    if (imported.get) {
      console.log("Setting up get at " + page.url);
      app.get(ParseUrl(page.url), HandleQueryType(imported.get));
    }

    if (imported.delete) {
      console.log("Setting up delete at " + page.url);
      app.delete(ParseUrl(page.url), HandleQueryType(imported.delete));
    }

    if (imported.patch) {
      console.log("Setting up patch at " + page.url);
      app.patch(ParseUrl(page.url), HandleBodyType(imported.patch));
    }

    if (imported.post) {
      console.log("Setting up post at " + page.url);
      app.post(ParseUrl(page.url), HandleBodyType(imported.post));
    }

    if (imported.put) {
      console.log("Setting up put at " + page.url);
      app.put(ParseUrl(page.url), HandleBodyType(imported.put));
    }
  }

  app.get("*", async (req, res) => {
    await render_error({ error: 404 }, req, res);
  });

  const port = parseInt(options.port ?? "3000");
  const server = app.listen(port, () => {
    console.log("Listening on port " + port);
  });

  return {
    stop: () => server.close(),
  };
}

export type Server = PromiseType<ReturnType<typeof StartApp>>;
