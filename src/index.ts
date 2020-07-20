import express, { Request, Response } from "express";
import { ParseQueryString } from "./utils/query-string-parser";
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
import { CacheInProduction } from "./utils/cache";
import fs from "fs-extra";
import bodyParser from "body-parser";
import path from "path";
import { render } from "node-sass";
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const IsOptions = IsObject({
  components: Optional(IsString),
  pages: Optional(IsString),
  layout: Optional(IsString),
  port: Optional(IsString),
  static: Optional(IsString),
  error_page: Optional(IsString),
  sass: Optional(IsString),
});

const IsResponse = IsObject({
  status: IsNumber,
  headers: Optional(IsDictionary(IsString)),
  data: DoNotCare,
});

const options = ParseQueryString();
Assert(IsOptions, options, "Invalid command line parameters");
const pages = path.normalize(options.pages ?? "./src/pages");
const components = path.normalize(options.components ?? "./src/components");
const error_page = path.normalize(
  options.error_page ?? "./src/pages/_error.tpe"
);
const layout = path.normalize(options.layout ?? "./src/layout.tpe");
const sass = options.sass && path.normalize(options.sass);
const GetLayout = CacheInProduction(() => fs.readFile(layout, "utf-8"));

const handler = (route: string) => {
  const url =
    "/" +
    route
      .replace(pages, "")
      .replace(/\\/g, "/")
      .replace(".js", "")
      .replace("/index", "");
  const imported = require("../" + route.replace(/\\/g, "/"));

  const querytype = async (req: Request, res: Response) => {
    console.log(`Handling ${req.method} for ${url}`);
    try {
      const query = { ...req.params, ...req.query };
      const result = await imported.get(query);
      Assert(IsResponse, result, "Invalid JSON response");
      const c = await GetAllComponent(components);
      const response = TemplateParser(c)(
        await GetLayout(),
        result.status > 399
          ? await fs.readFile(error_page, "utf-8")
          : await fs.readFile(route.replace(".js", ".tpe"), "utf-8"),
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
  };

  const bodytype = async (req: Request, res: Response) => {
    console.log(`Handling ${req.method} for ${url}`);
    try {
      const query = { ...req.params, ...req.query };
      const body = { ...req.body };
      const result = await imported.get(query, body);
      Assert(IsResponse, result, "Invalid JSON response");
      const c = await GetAllComponent(components);
      const response = TemplateParser(c)(
        await GetLayout(),
        result.status > 399
          ? await fs.readFile(error_page, "utf-8")
          : await fs.readFile(route.replace(".js", ".tpe"), "utf-8"),
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
};

(async () => {
  const routes = await ReadDirectory(pages);
  for (const route of routes.filter((r) => r.endsWith(".js"))) {
    handler(route);
  }

  if (options.static) {
    app.use("/_", express.static(options.static));
  }

  if (sass) {
    const sasstext = await new Promise<string>((res, rej) => {
      render({ file: sass }, (err, d) => {
        if (err) {
          rej(err);
        }

        res(d.css.toString("utf-8"));
      });
    });
    app.get("/rendered-sass.css", (req, res) => {
      res.setHeader("Content-Type", "text/css; charset=UTF-8");
      res.status(200).send(sasstext);
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
