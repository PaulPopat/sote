import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsString,
  IsType,
  IsUnion,
  Optional,
} from "https://deno.land/x/safe_type@2.2.3/mod.ts";

export const IsOptions = IsObject({
  static: Optional(IsString),
  pages: Optional(IsString),
  components: Optional(
    IsArray(IsUnion(IsObject({ path: IsString, prefix: IsString }), IsString))
  ),
  author: Optional(IsString),
  favicon: Optional(IsArray(IsObject({ path: IsString, size: IsString }))),
  behavior_in_tag: Optional(IsBoolean),
  lang: Optional(IsString),
  port: Optional(IsNumber),
  resources: Optional(IsString),
  email: Optional(IsBoolean),
  google_tracking_id: Optional(IsString),
});

export type Options = IsType<typeof IsOptions>;
