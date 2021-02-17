import {
  serve,
  ServerRequest,
  Response,
} from "https://deno.land/std@0.87.0/http/server.ts";
import { serveFile } from "https://deno.land/std@0.87.0/http/file_server.ts";
import { v4 } from "https://deno.land/std@0.87.0/uuid/mod.ts";
import { MatchUrl, RemoveUrlParameters } from "../util/url.ts";
import { EvaluateAsync } from "../util/evaluate.ts";
import { BuildPage } from "./page-builder.ts";
import * as Path from "https://deno.land/std/path/mod.ts";
import { PagesModel } from "../types/app.ts";
import { Options } from "../types/config.ts";
import { ParseCookies } from "./cookie-parser.ts";
import { ReadDirectory } from "../file-system.ts";

type Handler = (
  request: ServerRequest,
  params: Record<string, string | string[]>
) => Promise<Response | undefined>;

function ServeAsStatic(content: string, content_type: string): Handler {
  return async (request, params) => {
    if (request.method.toLowerCase() !== "get") {
      return { status: 404 };
    }
    return {
      status: 200,
      body: content,
      headers: new Headers({
        "Content-Type": content_type,
        "Cache-Control": "public",
      }),
    };
  };
}

function ServeStaticFile(path: string): Handler {
  return async (request, params) => {
    if (request.method.toLowerCase() !== "get") {
      return { status: 404 };
    }

    return await serveFile(request, path);
  };
}

function PageRenderer(
  page: PagesModel["pages"][number],
  resources: PagesModel,
  context_data: any,
  options: Options
): Handler {
  const cached_responses: Record<
    string,
    | {
        timeout: number;
        props: any;
      }
    | undefined
  > = {};
  return async (request, params): Promise<Response | undefined> => {
    const handler = page.model.server_js[request.method.toLowerCase()];
    if (!handler) {
      return { status: 404 };
    }

    try {
      const cookies = ParseCookies(request.headers);
      const props = await (async () => {
        const redirectId = cookies.Get("redirect-id");
        const cached = cached_responses[redirectId ?? ""];
        if (redirectId && cached) {
          clearTimeout(cached.timeout);
          const props = cached.props;
          cached_responses[redirectId] = undefined;
          cookies.Set("redirect-id", { value: "", expires: new Date() });
          return props;
        }

        const body_data = await Deno.readAll(request.body);
        const body = JSON.parse(
          body_data.length > 0
            ? new TextDecoder("utf-8").decode(body_data)
            : "{}"
        );
        return await EvaluateAsync(handler, [
          { name: "query", value: params },
          { name: "body", value: body },
          { name: "context", value: context_data },
          { name: "req", value: request },
        ]);
      })();

      if (props === "no-render") {
        return;
      }

      if (request.method.toLowerCase() !== "get") {
        const redirectId = v4.generate();
        cached_responses[redirectId] = {
          props,
          timeout: setTimeout(() => {
            cached_responses[redirectId] = undefined;
          }, 60 * 1000),
        };
        const expires = new Date();
        expires.setSeconds(expires.getSeconds() + 60);
        cookies.Set("redirect-id", { value: redirectId, expires: expires });
        return {
          status: 303,
          headers: cookies.Apply(new Headers({ Location: request.url })),
        };
      }

      const html = await BuildPage(
        page,
        resources.components,
        resources.js_bundle,
        resources.css_bundle,
        props,
        context_data,
        options,
        cookies.Get("track-ga") == "true"
      );

      return {
        status: 200,
        body: html,
        headers: new Headers({ "Content-Type": "text/html" }),
      };
    } catch (e) {
      console.log(`Error rendering ${page.url} see below`);
      console.error(e);
      return { status: 500 };
    }
  };
}

export async function StartApp(resources: PagesModel, options: Options) {
  const context_data = options.resources
    ? { ...import(Path.resolve(options.resources)) }
    : {};

  const handlers = {} as Record<string, Handler>;
  if (options.static) {
    for await (const file of ReadDirectory(options.static)) {
      const url = options.static.endsWith("/")
        ? file.replace(options.static, "/_/")
        : file.replace(options.static, "/_");
      console.log(`Serving static file ${file} as ${url}`);
      handlers[url] = ServeStaticFile(file);
    }
  }

  if (resources.js_bundle) {
    console.log(`Serving common js at /js/common.bundle.js`);
    handlers["/js/common.bundle.js"] = ServeAsStatic(
      resources.js_bundle,
      "text/javascript"
    );
  }

  if (resources.css_bundle) {
    console.log(`Serving common css at /css/index.bundle.css`);
    handlers["/css/index.bundle.css"] = ServeAsStatic(
      resources.css_bundle,
      "text/css"
    );
  }

  for (const page of resources.pages) {
    if (page.model.client_js) {
      const url = RemoveUrlParameters(`/js${page.url}.js`);
      console.log(`Serving ${url}`);
      handlers[url] = ServeAsStatic(page.model.client_js, "text/javascript");
    }

    if (page.model.css) {
      const url = RemoveUrlParameters(
        `/css${RemoveUrlParameters(page.url)}.css`
      );
      console.log(`Serving ${url}`);
      handlers[url] = ServeAsStatic(page.model.css, "text/css");
      console.log(`Serving /css${RemoveUrlParameters(page.url)}.css`);
    }

    console.log(`Serving ${page.url || "/"}`);
    handlers[page.url || "/"] = PageRenderer(
      page,
      resources,
      context_data,
      options
    );
  }

  const handler_keys = Object.keys(handlers);
  const server = serve({ port: options.port ?? 8080 });
  console.log("App listening at port " + (options.port ?? 8080));

  for await (const request of server) {
    try {
      const [match, params] = MatchUrl(request.url, handler_keys);
      if (!match) {
        request.respond({ status: 404 });
        continue;
      }

      const response = await handlers[match](request, params);
      if (response) {
        request.respond(response);
      }
    } catch (e) {
      console.error(e);
      request.respond({ status: 500 });
    }
  }
}
