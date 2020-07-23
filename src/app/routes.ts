import path from "path";

const compiled_js = "./.sote/js";

export const Routes = {
  components: "./.sote/components.json",
  compiled_js: "./.sote/js",
  pages: "./.sote/pages.json",
  sass: "./.sote/rendered-sass.css",
  error: "./.sote/_error.tpe",
  common_js: path.join(compiled_js, "common.bundle.js"),
};
