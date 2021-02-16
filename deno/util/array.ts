type Iterator<T> =
  | AsyncGenerator<T>
  | Generator<T>
  | (T | Promise<T>)[]
  | (() => AsyncGenerator<T>)
  | (() => Generator<T>);

export function Iterate<T>(data: Iterator<T>) {
  const d = typeof data === "function" ? data() : data;

  return {
    Select<TReturn>(
      selector: (item: T, index: number) => Promise<TReturn> | TReturn
    ) {
      return Iterate(async function* () {
        let index = 0;
        for await (const item of d) {
          yield await Promise.resolve(selector(item, index));
          index++;
        }
      });
    },
    FlatSelect<TReturn>(
      selector: (
        item: T,
        index: number
      ) =>
        | Promise<AsyncGenerator<TReturn> | Generator<TReturn>>
        | AsyncGenerator<TReturn>
        | Generator<TReturn>
    ) {
      return Iterate(async function* () {
        let index = 0;
        for await (const item of d) {
          const result = await Promise.resolve(selector(item, index));
          for await (const part of result) {
            yield part;
          }

          index++;
        }
      });
    },
    WhereIs<S extends T = T>(predicate: (item: T, index: number) => item is S) {
      return Iterate(async function* () {
        let index = 0;
        for await (const item of d) {
          if (await Promise.resolve(predicate(item, index))) {
            yield item as S;
          }

          index++;
        }
      });
    },
    Where<S extends T = T>(predicate: (item: T, index: number) => boolean | Promise<boolean>) {
      return Iterate(async function* () {
        let index = 0;
        for await (const item of d) {
          if (await Promise.resolve(predicate(item, index))) {
            yield item as S;
          }

          index++;
        }
      });
    },
    async Count(
      predicate: (item: T, index: number) => boolean | Promise<boolean>
    ) {
      let result = 0;
      let index = 0;
      for await (const item of d) {
        if (await Promise.resolve(predicate(item, index))) {
          result++;
        }

        index++;
      }

      return result;
    },
    async *Generate() {
      for await (const item of d) {
        yield item;
      }
    },
    async ToArray() {
      const result: T[] = [];
      for await (const item of d) {
        result.push(item);
      }

      return result;
    },
    async Reduce<TResult>(
      initial: TResult,
      selector: (
        new_entry: T,
        current: TResult,
        index: number
      ) => TResult | Promise<TResult>
    ) {
      let index = 0;
      let current = initial;
      for await (const item of d) {
        current = await Promise.resolve(selector(item, current, index));
        index++;
      }

      return current;
    },
  };
}
