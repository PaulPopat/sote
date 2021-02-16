import { Dict } from "../types/util.ts";

export function TransformKeys<T>(
  input: Dict<T>,
  transform: (key: string) => string
) {
  return Object.keys(input).reduce(
    (c, n) => ({ ...c, [transform(n)]: input[n] }),
    {} as Dict<T>
  );
}

export function TransformProperties<TI, TR>(
  input: Dict<TI>,
  transform: (property: TI) => TR
) {
  return Object.keys(input).reduce(
    (c, n) => ({ ...c, [n]: transform(input[n] as any) }),
    {} as Dict<TR>
  );
}

export async function TransformPropertiesAsync<TI, TR>(
  input: Dict<TI>,
  transform: (property: TI) => Promise<TR>
) {
  const result = {} as Dict<TR>;
  for (const key in input) {
    result[key] = await transform(input[key] as any);
  }
  return result;
}

export function ToKeyValuePairing<T>(input: Dict<T>) {
  return Object.keys(input).reduce(
    (c, k) => [...c, [k, input[k] as any] as const],
    [] as (readonly [string, T])[]
  );
}

export function NotUndefined<T>(input: T | undefined): input is T {
  return input != null;
}
