import path from "path";

const compiled_js = "./.sote/js";

export const Routes = {
  compiled_js: "./.sote/js",
  compiled_css: "./.sote/css",
  pages: "./.sote/pages.json",
  sass: "./.sote/rendered-sass.css",
  common_js: path.join(compiled_js, "common.bundle.js"),
};
