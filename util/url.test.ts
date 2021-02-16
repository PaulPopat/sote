import { assertEquals } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { ParseUrl, RemoveUrlParameters } from "./url.ts";

Deno.test("Replaces a url parameter", () => {
  assertEquals(ParseUrl("/hello/[wonderful]/world"), "/hello/:wonderful/world");
});

Deno.test("Ignores parameters across slashes", () => {
  assertEquals(
    ParseUrl("/hello/[wonderful/world]"),
    "/hello/[wonderful/world]"
  );
});

Deno.test("Ignores a normal url", () => {
  assertEquals(ParseUrl("/hello/wonderful/world"), "/hello/wonderful/world");
});

Deno.test("Replaces a url parameter", () => {
  assertEquals(
    RemoveUrlParameters("/hello/[wonderful]/world"),
    "/hello/wonderful/world"
  );
});

Deno.test("Ignores parameters across slashes", () => {
  assertEquals(
    RemoveUrlParameters("/hello/[wonderful/world]"),
    "/hello/[wonderful/world]"
  );
});

Deno.test("Ignores a normal url", () => {
  assertEquals(
    RemoveUrlParameters("/hello/wonderful/world"),
    "/hello/wonderful/world"
  );
});
