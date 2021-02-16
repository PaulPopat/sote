import {
  Application,
  Router,
  RouterContext,
  send,
} from "https://deno.land/x/oak/mod.ts";
import { v4 } from "https://deno.land/std@0.87.0/uuid/mod.ts";
import { ParseUrl, RemoveUrlParameters } from "../util/url.ts";
import { EvaluateAsync } from "../util/evaluate.ts";
import { BuildPage } from "./page-builder.ts";
import * as Path from "https://deno.land/std/path/mod.ts";
import { PagesModel } from "../types/app.ts";
import { Options } from "../types/config.ts";

function ServeAsStatic(content: string, content_type: string) {
  return (context: RouterContext) => {
    context.response.headers.set("Content-Type", content_type);
    context.response.headers.set("Cache-Control", "public");

    context.response.body = content;
    context.response.status = 200;
  };
}
export async function StartApp(resources: PagesModel, options: Options) {
  const router = new Router();

  const context_data = options.resources
    ? { ...import(Path.resolve(options.resources)) }
    : {};

  function PageRenderer(page: PagesModel["pages"][number]) {
    const cached_responses: Record<
      string,
      | {
          timeout: number;
          props: any;
        }
      | undefined
    > = {};
    return async (context: RouterContext) => {
      const req = context.request;
      const res = context.response;
      const handler = page.model.server_js[req.method.toLowerCase()];
      if (!handler) {
        res.status = 404;
        return;
      }

      try {
        const props = await (async () => {
          const redirectId = context.cookies.get("redirect-id");
          const cached = cached_responses[redirectId ?? ""];
          if (redirectId && cached) {
            clearTimeout(cached.timeout);
            const props = cached.props;
            cached_responses[redirectId] = undefined;
            context.cookies.set("redirect-id", "", { expires: new Date() });
            return props;
          }

          const query = { ...context.params };
          const body = { ...req.body };
          return await EvaluateAsync(handler, [
            { name: "query", value: query },
            { name: "body", value: body },
            { name: "context", value: context_data },
            { name: "req", value: req },
            { name: "res", value: res },
          ]);
        })();

        if (props === "no-render") {
          return;
        }

        if (req.method.toLowerCase() !== "get") {
          const redirectId = v4.generate();
          cached_responses[redirectId] = {
            props,
            timeout: setTimeout(() => {
              cached_responses[redirectId] = undefined;
            }, 60 * 1000),
          };
          context.cookies.set("redirect-id", redirectId, { maxAge: 60 * 1000 });
          res.status = 303;
          res.redirect(req.url);
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
          context.cookies.get("track-ga") == "true"
        );

        res.headers.set("Content-Type", "text/html");
        res.status = 200;
        res.body = html;
      } catch (e) {
        console.log(`Error rendering ${page.url} see below`);
        console.error(e);
        res.status = 500;
        return;
      }
    };
  }

  if (resources.js_bundle) {
    console.log(`Serving common js at /js/common.bundle.js`);
    router.get(
      "/js/common.bundle.js",
      ServeAsStatic(resources.js_bundle, "text/javascript")
    );
  }

  if (resources.css_bundle) {
    console.log(`Serving common css at /css/index.bundle.css`);
    router.get(
      "/css/index.bundle.css",
      ServeAsStatic(resources.css_bundle, "text/css")
    );
  }

  for (const page of resources.pages) {
    if (page.model.client_js) {
      console.log(`Serving /js${RemoveUrlParameters(page.url)}.js`);
      router.get(
        RemoveUrlParameters(`/js${page.url}.js`),
        ServeAsStatic(page.model.client_js, "text/javascript")
      );
    }

    if (page.model.css) {
      console.log(`Serving /css${RemoveUrlParameters(page.url)}.css`);
      router.get(
        RemoveUrlParameters(`/css${page.url}.css`),
        ServeAsStatic(page.model.css, "text/css")
      );
    }

    console.log(`Serving ${page.url || "/"}`);
    router.all(ParseUrl(page.url) || "/", PageRenderer(page));
  }

  const app = new Application();

  const static_route = options.static;
  if (static_route) {
    console.log(`Serving static directory at ${options.static}`);
    router.get("/_/**", async (context) => {
      await send(context, context.request.url.pathname, { root: static_route });
    });
  }

  app.use(router.routes());
  app.use(router.allowedMethods());
  await app.listen({ port: options.port ?? 8080 });
}
