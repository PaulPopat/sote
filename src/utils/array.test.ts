import { AsyncLinq } from "./array";

const create_promise = (result: number) =>
  new Promise<number>((res) => setTimeout(() => res(result), 1));

describe("AsyncLinq", () => {
  it("Performs select", async () => {
    expect(
      await AsyncLinq([1, 2, 3])
        .Select((i) => i + 1)
        .ToArray()
    ).toStrictEqual([2, 3, 4]);
  });

  it("Performs select on promises", async () => {
    expect(
      await AsyncLinq([create_promise(1), create_promise(2), create_promise(3)])
        .Select((i) => i + 1)
        .ToArray()
    ).toStrictEqual([2, 3, 4]);
  });

  it("Performs select on a mixture of promises and not", async () => {
    expect(
      await AsyncLinq([create_promise(1), 2, create_promise(3)])
        .Select((i) => i + 1)
        .ToArray()
    ).toStrictEqual([2, 3, 4]);
  });

  it("Performs asynchroness operations in select", async () => {
    expect(
      await AsyncLinq([1, 2, 3])
        .Select((i) => create_promise(i + 1))
        .ToArray()
    ).toStrictEqual([2, 3, 4]);
  });

  it("Performs where", async () => {
    expect(
      await AsyncLinq([1, 2, 3])
        .Where((i) => i === 2 || i === 3)
        .ToArray()
    ).toStrictEqual([2, 3]);
  });

  it("Performs where on promises", async () => {
    expect(
      await AsyncLinq([create_promise(1), create_promise(2), create_promise(3)])
        .Where((i) => i === 2 || i === 3)
        .ToArray()
    ).toStrictEqual([2, 3]);
  });

  it("Performs where on a mixture of promises and not", async () => {
    expect(
      await AsyncLinq([create_promise(1), 2, create_promise(3)])
        .Where((i) => i === 2 || i === 3)
        .ToArray()
    ).toStrictEqual([2, 3]);
  });

  it("Performs asynchroness operations in where", async () => {
    expect(
      await AsyncLinq([1, 2, 3])
        .Where(async (i) => i === 2 || i === 3)
        .ToArray()
    ).toStrictEqual([2, 3]);
  });

  it("Performs count", async () => {
    expect(await AsyncLinq([1, 2, 3]).Count((i) => i === 2 || i === 3)).toBe(2);
  });

  it("Performs count on promises", async () => {
    expect(
      await AsyncLinq([
        create_promise(1),
        create_promise(2),
        create_promise(3),
      ]).Count((i) => i === 2 || i === 3)
    ).toBe(2);
  });

  it("Performs count on a mixture of promises and not", async () => {
    expect(
      await AsyncLinq([create_promise(1), 2, create_promise(3)]).Count(
        (i) => i === 2 || i === 3
      )
    ).toBe(2);
  });

  it("Performs asynchroness operations in count", async () => {
    expect(
      await AsyncLinq([1, 2, 3]).Count(async (i) => i === 2 || i === 3)
    ).toBe(2);
  });
});
