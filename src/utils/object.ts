export function TransformKeys<T>(
  input: NodeJS.Dict<T>,
  transform: (key: string) => string
) {
  return Object.keys(input).reduce(
    (c, n) => ({ ...c, [transform(n)]: input[n] }),
    {} as NodeJS.Dict<T>
  );
}

export function TransformProperties<TI, TR>(
  input: NodeJS.Dict<TI>,
  transform: (key: TI) => TR
) {
  return Object.keys(input).reduce(
    (c, n) => ({ ...c, [n]: transform(input[n] as any) }),
    {} as NodeJS.Dict<TR>
  );
}
