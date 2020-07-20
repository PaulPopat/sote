import { IsProduction } from "./environment";

export function CacheInProduction<T>(action: () => T) {
  if (IsProduction) {
    let cache: T;
    return () => {
      cache = cache || action();
      return cache;
    };
  }

  return action;
}
