import {
  IsObject,
  Optional,
  IsString,
  IsArray,
  IsUnion,
  IsType,
  IsDictionary,
} from "https://deno.land/x/safe_type@2.2.3/mod.ts";

export type XmlElement = {
  tag: string;
  attributes: Record<string, string>;
  children: XmlNode[];
};

export type XmlText = { text: string };

export const IsXmlText = IsObject({ text: IsString });

export const IsXmlElement = IsObject({
  tag: IsString,
  attributes: IsDictionary(IsString),
  children: IsArray((a): a is XmlElement | XmlText =>
    IsUnion(IsXmlElement, IsXmlText)(a)
  ),
});

export const IsXmlNode = IsUnion(IsXmlElement, IsXmlText);

export type XmlNode = IsType<typeof IsXmlNode>;

export const IsTpeFile = IsObject({
  server_js: Optional(IsDictionary(IsString)),
  client_js: Optional(IsString),
  xml_template: IsArray(IsXmlNode),
  css: Optional(IsString),
  title: Optional(IsString),
  language: Optional(IsString),
});

export type TpeFile = IsType<typeof IsTpeFile>;

export const IsPageModel = IsObject({
  server_js: IsDictionary(IsString),
  client_js: IsString,
  xml_template: IsArray(IsXmlNode),
  css: IsString,
  title: IsString,
  description: IsString,
  language: Optional(IsString),
});

export type PageModel = IsType<typeof IsPageModel>;

export const IsPagesModel = IsObject({
  pages: IsArray(IsObject({ url: IsString, model: IsPageModel })),
  css_bundle: IsString,
  js_bundle: IsString,
  components: IsDictionary(IsTpeFile),
});

export type PagesModel = IsType<typeof IsPagesModel>;
