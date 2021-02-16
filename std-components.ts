import { TpeFile } from "./types/app.ts";

export const StdComponents: Record<string, TpeFile> = {
  "std:email:is-mso": {
    xml_template: [
      {
        tag: "EMAIL_IS_MSO",
        attributes: {},
        children: [{ tag: "children", attributes: {}, children: [] }],
      },
    ],
    server_js: undefined,
    client_js: undefined,
    css: undefined,
    title: undefined,
    language: undefined,
  },
  "std:email:not-mso": {
    xml_template: [
      {
        tag: "EMAIL_NOT_MSO",
        attributes: {},
        children: [{ tag: "children", attributes: {}, children: [] }],
      },
    ],
    server_js: undefined,
    client_js: undefined,
    css: undefined,
    title: undefined,
    language: undefined,
  },
};
