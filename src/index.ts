import express, { Request, Response } from "express";
import {
  IsObject,
  IsString,
  Optional,
  IsNumber,
  IsDictionary,
  DoNotCare,
} from "@paulpopat/safe-type";
import { Assert } from "./utils/types";
import { ReadDirectory } from "./utils/file-system";
import { GetAllComponent } from "./component";
import TemplateParser from "./template-parser";
import fs from "fs-extra";
import bodyParser from "body-parser";
import { render } from "node-sass";
import { IsProduction } from "./utils/environment";
import { GetOptions } from "./utils/options-parser";
import path from "path";
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const IsResponse = IsObject({
  status: IsNumber,
  headers: Optional(IsDictionary(IsString)),
  data: DoNotCare,
});

(async () => {
  const options = await GetOptions();

  const handler = async (route: string) => {
    let url = route
      .replace(options.pages, "")
      .replace(/\\/g, "/")
      .replace(".tpe", "")
      .replace("/index", "");
    if (!url) {
      url = "/";
    }
    const filepath = "./" + route.replace(/\\/g, "/").replace(".tpe", ".js");
    if (route.endsWith("_error.tpe")) {
      return;
    }

    try {
      const imported = require(path.resolve(filepath));
      const querytype = async (req: Request, res: Response) => {
        console.log(`Handling ${req.method} for ${url}`);
        try {
          const query = { ...req.params, ...req.query };
          const result = await imported[req.method.toLowerCase()](
            query,
            req.headers
          );
          Assert(IsResponse, result, "Invalid JSON response");
          const c = await GetAllComponent(options.components);
          const response = TemplateParser(c)(
            await options.GetLayout(),
            result.status > 399
              ? await fs.readFile(options.error_page, "utf-8")
              : await fs.readFile(route, "utf-8"),
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

        console.log(`Finished handling ${req.method} for ${url}`);
      };

      const bodytype = async (req: Request, res: Response) => {
        console.log(`Handling ${req.method} for ${url}`);
        try {
          const query = { ...req.params, ...req.query };
          const body = { ...req.body };
          const result = await imported[req.method.toLowerCase()](
            query,
            body,
            req.headers
          );
          Assert(IsResponse, result, "Invalid JSON response");
          const c = await GetAllComponent(options.components);
          const response = TemplateParser(c)(
            await options.GetLayout(),
            result.status > 399
              ? await fs.readFile(options.error_page, "utf-8")
              : await fs.readFile(route, "utf-8"),
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

        console.log(`Finished handling ${req.method} for ${url}`);
      };

      if (imported.get) {
        console.log("Setting up get at " + url);
        app.get(url, querytype);
      }

      if (imported.delete) {
        console.log("Setting up delete at " + url);
        app.delete(url, querytype);
      }

      if (imported.patch) {
        console.log("Setting up patch at " + url);
        app.patch(url, bodytype);
      }

      if (imported.post) {
        console.log("Setting up post at " + url);
        app.post(url, bodytype);
      }

      if (imported.put) {
        console.log("Setting up put at " + url);
        app.put(url, bodytype);
      }
    } catch (e) {
      console.log(
        `Unable to set up handler for ${url} so creating a simple get`
      );
      if (!IsProduction) {
        console.error(e);
      }

      const c = await GetAllComponent(options.components);
      const response = TemplateParser(c)(
        await options.GetLayout(),
        await fs.readFile(route, "utf-8"),
        {}
      );
      app.get(url, async (req, res) => {
        console.log(`Handling ${req.method} for ${url}`);
        res.setHeader("Content-Type", "text/html; charset=UTF-8");
        res.status(200).send(response);
      });
    }
  };

  const routes = await ReadDirectory(options.pages);
  for (const route of routes.filter((r) => r.endsWith(".tpe"))) {
    await handler(route);
  }

  if (options.staticroute) {
    app.use("/_", express.static(options.staticroute));
  }

  const sass = options.sass;
  if (sass) {
    const sasstext = await new Promise<string>((res, rej) => {
      render({ file: sass }, (err, d) => {
        if (err) {
          rej(err);
        }

        res(d.css.toString("utf-8"));
      });
    });
    app.get("/rendered-sass.css", async (req, res) => {
      res.setHeader("Content-Type", "text/css; charset=UTF-8");
      res.status(200).send(
        IsProduction
          ? sasstext
          : await new Promise<string>((res, rej) => {
              render({ file: sass }, (err, d) => {
                if (err) {
                  rej(err);
                }

                res(d.css.toString("utf-8"));
              });
            })
      );
    });
  }

  const port = parseInt(options.port ?? "3000");
  app.listen(port, () => {
    console.log("Listening on port " + port);
  });
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
