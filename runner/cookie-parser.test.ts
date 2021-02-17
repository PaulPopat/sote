import { ParseCookies } from "./cookie-parser.ts";
import { assertEquals } from "https://deno.land/std@0.86.0/testing/asserts.ts";

Deno.test("Parses a single cookie", () => {
  assertEquals(
    ParseCookies(new Headers({ Cookie: "test=value" })).Get("test"),
    "value"
  );
});

Deno.test("Parses multiple cookies", () => {
  const subject = ParseCookies(
    new Headers({ Cookie: "test=value; another=second" })
  );

  assertEquals(subject.Get("test"), "value");
  assertEquals(subject.Get("another"), "second");
});

Deno.test("Sets a basic cookie", () => {
  const subject = ParseCookies(new Headers());

  subject.Set("test", { value: "value", expires: new Date(2000, 1, 1) });

  const test = subject.Apply(new Headers());
  assertEquals(
    test.get("Set-Cookie"),
    "test=value; Expires=Tue, 01 Feb 2000 00:00:00 GMT;"
  );
});

Deno.test("Sets multiple cookies", () => {
  const subject = ParseCookies(new Headers());

  subject.Set("test", { value: "value", expires: new Date(2000, 1, 1) });
  subject.Set("another", { value: "second", expires: new Date(2000, 1, 1) });

  const test = subject.Apply(new Headers());
  assertEquals(
    test.get("Set-Cookie"),
    "test=value; Expires=Tue, 01 Feb 2000 00:00:00 GMT;, another=second; Expires=Tue, 01 Feb 2000 00:00:00 GMT;"
  );
});

Deno.test("Sets a basic cookie", () => {
  const subject = ParseCookies(new Headers());

  subject.Set("test", { value: "value", expires: new Date(2000, 1, 1) });

  const test = subject.Apply(new Headers());
  assertEquals(
    test.get("Set-Cookie"),
    "test=value; Expires=Tue, 01 Feb 2000 00:00:00 GMT;"
  );
});