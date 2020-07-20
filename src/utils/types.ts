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
