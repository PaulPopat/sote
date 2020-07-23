import { Checker } from "@paulpopat/safe-type";

export function Assert<T>(
  checker: Checker<T>,
  subject: any,
  error_message: string = "Invalid type"
): asserts subject is T {
  if (!checker(subject)) {
    throw new Error(error_message);
  }
}

export function ArrayIfNotArray<T>(arg: T | T[]) {
  if (Array.isArray(arg)) {
    return arg;
  }

  return [arg];
}

export type PromiseType<T> = T extends Promise<infer U> ? U : unknown;