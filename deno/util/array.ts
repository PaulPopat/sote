function IsPromise<T>(item: T | Promise<T>): item is Promise<T> {
  return typeof item === "object" && "then" in item;
}

type AsyncLinqer<T> = {
  Select<TResult>(
    selector: (item: T, index: number) => TResult | Promise<TResult>
  ): AsyncLinqer<TResult>;
  Where<S extends T>(
    predicate: (item: T, index: number) => item is S
  ): AsyncLinqer<S>;
  Where(
    predicate: (item: T, index: number) => boolean | Promise<boolean>
  ): AsyncLinqer<T>;
  Count(
    predicate: (item: T, index: number) => boolean | Promise<boolean>
  ): Promise<number>;
  ToArray: () => Promise<T[]>;
  Total: number;
};

type AsyncLinqerArgs<T> =
  | (T | void | never | undefined)
  | Promise<T | void | never | undefined>;

export function AsyncLinq<T>(content: AsyncLinqerArgs<T>[]): AsyncLinqer<T> {
  return {
    Select(selector) {
      return AsyncLinq(
        content.map(async (i, index) => {
          if (IsPromise(i)) {
            const result = await i;
            if (result) {
              return await Promise.resolve(selector(result, index));
            }
          } else if (i) {
            return await Promise.resolve(selector(i, index));
          }
        })
      );
    },
    Where(predicate: (item: T, index: number) => boolean | Promise<boolean>) {
      return AsyncLinq(
        content.map(
          async (i, index): Promise<T | void> => {
            if (IsPromise(i)) {
              const result = await i;
              if (result && (await Promise.resolve(predicate(result, index)))) {
                return result;
              }
            } else if (i && (await Promise.resolve(predicate(i, index)))) {
              return i;
            }
          }
        )
      );
    },
    async Count(predicate) {
      let result = 0;
      for (let index = 0; index < content.length; index++) {
        const i = content[index];
        if (IsPromise(i)) {
          const r = await i;
          if (r && (await Promise.resolve(predicate(r, index)))) {
            result++;
          }
        } else if (i && (await Promise.resolve(predicate(i, index)))) {
          result++;
        }
      }

      return result;
    },
    async ToArray() {
      const result: T[] = [];
      for (const i of content) {
        if (IsPromise(i)) {
          const r = await i;
          if (r) {
            result.push(r);
          }
        } else if (i) {
          result.push(i);
        }
      }

      return result;
    },
    Total: content.length,
  };
}
