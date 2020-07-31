export function ParseUrl(url: string) {
  return url.replace(/\[([a-zA-Z0-9]+)\]/gm, ":$1");
}

export function RemoveUrlParameters(url: string) {
  return url.replace(/\[([a-zA-Z0-9]+)\]/gm, "$1");
}