import { ParseUrl, RemoveUrlParameters } from "./url";

describe("ParseUrl", () => {
  it("Replaces a url parameter", () => {
    expect(ParseUrl("/hello/[wonderful]/world")).toBe(
      "/hello/:wonderful/world"
    );
  });

  it("Ignores parameters across slashes", () => {
    expect(ParseUrl("/hello/[wonderful/world]")).toBe(
      "/hello/[wonderful/world]"
    );
  });

  it("Ignores a normal url", () => {
    expect(ParseUrl("/hello/wonderful/world")).toBe("/hello/wonderful/world");
  });
});

describe("RemoveUrlParameters", () => {
  it("Replaces a url parameter", () => {
    expect(RemoveUrlParameters("/hello/[wonderful]/world")).toBe(
      "/hello/wonderful/world"
    );
  });

  it("Ignores parameters across slashes", () => {
    expect(RemoveUrlParameters("/hello/[wonderful/world]")).toBe(
      "/hello/[wonderful/world]"
    );
  });

  it("Ignores a normal url", () => {
    expect(RemoveUrlParameters("/hello/wonderful/world")).toBe("/hello/wonderful/world");
  });
});

