import { assertEquals } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { Iterate } from "./array.ts";

const create_promise = (result: number) =>
  new Promise<number>((res) => setTimeout(() => res(result), 1));

Deno.test("Performs select", async () => {
  assertEquals(
    await Iterate([1, 2, 3])
      .Select((i) => i + 1)
      .ToArray(),
    [2, 3, 4]
  );
});

Deno.test("Performs select on promises", async () => {
  assertEquals(
    await Iterate([create_promise(1), create_promise(2), create_promise(3)])
      .Select((i) => i + 1)
      .ToArray(),
    [2, 3, 4]
  );
});

Deno.test("Performs select on a mixture of promises and not", async () => {
  assertEquals(
    await Iterate([create_promise(1), 2, create_promise(3)])
      .Select((i) => i + 1)
      .ToArray(),
    [2, 3, 4]
  );
});

Deno.test("Performs asynchroness operations in select", async () => {
  assertEquals(
    await Iterate([1, 2, 3])
      .Select((i) => create_promise(i + 1))
      .ToArray(),
    [2, 3, 4]
  );
});

Deno.test("Performs where", async () => {
  assertEquals(
    await Iterate([1, 2, 3])
      .Where((i) => i === 2 || i === 3)
      .ToArray(),
    [2, 3]
  );
});

Deno.test("Performs where on promises", async () => {
  assertEquals(
    await Iterate([create_promise(1), create_promise(2), create_promise(3)])
      .Where((i) => (i === 2 || i === 3))
      .ToArray(),
    [2, 3]
  );
});

Deno.test("Performs where on a mixture of promises and not", async () => {
  assertEquals(
    await Iterate([create_promise(1), 2, create_promise(3)])
      .Where((i) => i === 2 || i === 3)
      .ToArray(),
    [2, 3]
  );
});

Deno.test("Performs count", async () => {
  assertEquals(await Iterate([1, 2, 3]).Count((i) => i === 2 || i === 3), 2);
});

Deno.test("Performs count on promises", async () => {
  assertEquals(
    await Iterate([
      create_promise(1),
      create_promise(2),
      create_promise(3),
    ]).Count((i) => i === 2 || i === 3),
    2
  );
});

Deno.test("Performs count on a mixture of promises and not", async () => {
  assertEquals(
    await Iterate([create_promise(1), 2, create_promise(3)]).Count(
      (i) => i === 2 || i === 3
    ),
    2
  );
});

Deno.test("Performs asynchroness operations in count", async () => {
  assertEquals(
    await Iterate([1, 2, 3]).Count(async (i) => i === 2 || i === 3),
    2
  );
});
