import { assertEquals } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { RemoveUrlParameters, MatchUrl } from "./url.ts";

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

Deno.test("Matches a basic url", () => {
  assertEquals(MatchUrl("/test/url", ["/test/url", "/other/test"]), [
    "/test/url",
    {},
  ]);
});

Deno.test("Matches an empty url", () => {
  assertEquals(MatchUrl("/", ["/", "/other/test"]), ["/", {}]);
});

Deno.test("Matches an empty url with a single length one", () => {
  assertEquals(MatchUrl("/", ["/other", "/"]), ["/", {}]);
});

Deno.test("Matches urls of different lengths", () => {
  assertEquals(MatchUrl("/test", ["/", "/other/test", "/test"]), ["/test", {}]);
});

Deno.test("Returns nothing if no match", () => {
  assertEquals(MatchUrl("/test/url", []), [undefined, {}]);
});

Deno.test("Matches a url parameter", () => {
  assertEquals(MatchUrl("/test/url", ["/test/[part]", "/other/test"]), [
    "/test/[part]",
    { part: "url" },
  ]);
});

Deno.test("Matches multiple parameters", () => {
  assertEquals(
    MatchUrl("/test/url/another/url-bit", [
      "/test/[part]/another/[part2]",
      "/other/test",
    ]),
    ["/test/[part]/another/[part2]", { part: "url", part2: "url-bit" }]
  );
});

Deno.test("Chooses chooses no parameters if possible", () => {
  assertEquals(
    MatchUrl("/test/url/another/url-bit", [
      "/test/[part]/another/[part2]",
      "/test/url/another/[part2]",
      "/other/test",
    ]),
    ["/test/url/another/[part2]", { part2: "url-bit" }]
  );
});

Deno.test("Parses a simple query string", () => {
  assertEquals(
    MatchUrl("/test/url?test=value&second=another", [
      "/test/url",
      "/other/test",
    ]),
    ["/test/url", { test: "value", second: "another" }]
  );
});

Deno.test("Uri decodes query string", () => {
  assertEquals(
    MatchUrl("/test/url?test=val%20ue", ["/test/url", "/other/test"]),
    ["/test/url", { test: "val ue" }]
  );
});

Deno.test("Parses an array in a query string", () => {
  assertEquals(
    MatchUrl("/test/url?test=value&second=another&test=part", [
      "/test/url",
      "/other/test",
    ]),
    ["/test/url", { test: ["value", "part"], second: "another" }]
  );
});
