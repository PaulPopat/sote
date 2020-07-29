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

const IsResponse = IsObject({
  status: IsNumber,
  headers: Optional(IsDictionary(IsString)),
  data: DoNotCare,
});

async function ServeIfExists(path: string, url: string, app: Express) {
  if (await fs.pathExists(path)) {
    console.log("Serving " + url);
    app.use(url, express.static(path));
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

  for (const page of pages) {
    await ServeIfExists(
      page.page_js_path,
      `/js${page.url === "/" ? "" : page.url}`,
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
          const response = TemplateParser(
            result.status > 399
              ? await fs.readFile(Routes.error, "utf-8")
              : page.tpe_data,
            result.data
          );

          for (const key in result.headers) {
            res.setHeader(key, result.headers[key]);
          }
          res.setHeader("Content-Type", "text/html; charset=UTF-8");
          res.status(result.status).send(response);
        } catch (e) {
          console.error(e);
          res.status(500).send("Internal server error");
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
          const response = TemplateParser(
            result.status > 399
              ? await fs.readFile(Routes.error, "utf-8")
              : page.tpe_data,
            result.data
          );

          for (const key in result.headers) {
            res.setHeader(key, result.headers[key]);
          }
          res.setHeader("Content-Type", "text/html; charset=UTF-8");
          res.status(result.status).send(response);
        } catch (e) {
          console.error(e);
          res.status(500).send("Internal server error");
        }

        console.log(`Finished handling ${req.method} for ${page.url}`);
      };
    };

    if (imported.get) {
      console.log("Setting up get at " + page.url);
      app.get(page.url, HandleQueryType(imported.get));
    }

    if (imported.delete) {
      console.log("Setting up delete at " + page.url);
      app.delete(page.url, HandleQueryType(imported.delete));
    }

    if (imported.patch) {
      console.log("Setting up patch at " + page.url);
      app.patch(page.url, HandleBodyType(imported.patch));
    }

    if (imported.post) {
      console.log("Setting up post at " + page.url);
      app.post(page.url, HandleBodyType(imported.post));
    }

    if (imported.put) {
      console.log("Setting up put at " + page.url);
      app.put(page.url, HandleBodyType(imported.put));
    }
  }

  app.get("*", async (req, res) => {
    const response = TemplateParser(await fs.readFile(Routes.error, "utf-8"), {
      error: "404",
    });

    res.setHeader("Content-Type", "text/html; charset=UTF-8");
    res.status(404).send(response);
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
