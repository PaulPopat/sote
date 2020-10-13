import * as Babel from "@babel/core";
import Browserify from "browserify";
import Stream from "stream";
import Path from "path";
import { v4 as Uuid } from "uuid";

function CompileFromString(js: string) {
  const file = Uuid() + ".js";
  const s = new Stream.Readable();

  s.push(js);
  s.push(null);

  return new Promise<string>((res, rej) => {
    Browserify(s, { basedir: "./" }).bundle((err, buf) => {
      if (err) rej(err);
      else res(buf.toString());
    });
  });
}

export async function TransformJs(js: string) {
  const result = Babel.transformSync(js, {
    presets: ["@babel/preset-env"],
    plugins: [
      "@babel/plugin-proposal-class-properties",
      ["@babel/plugin-transform-runtime", { regenerator: true }],
    ],
  });

  if (!result) {
    return "";
  }

  return await CompileFromString(result.code ?? "");
}
