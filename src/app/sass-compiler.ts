import sass from "node-sass";
import UglifyCss from "uglifycss";

export async function CompileSass(index_path: string, quick: boolean) {
  const css = await new Promise<string>((res, rej) => {
    sass.render({ file: index_path }, (err, r) => {
      if (err) {
        rej(err);
      } else {
        res(r.css.toString("utf-8"));
      }
    });
  });

  if (quick) {
    return css;
  } else {
    return UglifyCss.processString(css, { uglyComments: true });
  }
}
