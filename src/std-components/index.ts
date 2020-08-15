import { TpeFile } from "../compiler/tpe-file-parser";

export const StdComponents: NodeJS.Dict<TpeFile> = {
  "std::email::is-mso": {
    xml_template: [
      {
        tag: "EMAIL_IS_MSO",
        attributes: {},
        children: [{ tag: "children", attributes: {}, children: [] }],
      },
    ],
  },
  "std::email::not-mso": {
    xml_template: [
      {
        tag: "EMAIL_NOT_MSO",
        attributes: {},
        children: [{ tag: "children", attributes: {}, children: [] }],
      },
    ],
  },
};
