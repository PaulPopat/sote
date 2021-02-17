export function RemoveUrlParameters(url: string) {
  return url.replace(/\[([a-zA-Z0-9]+)\]/gm, "$1");
}

export function MatchUrl(url: string, options: string[]) {
  const [path, query_string] = url.split("?");
  const query =
    query_string?.split("&").reduce((c, n) => {
      const [name, value] = n.split("=").map(decodeURIComponent);
      const existing = c[name];
      if (existing) {
        if (Array.isArray(existing)) {
          return { ...c, [name]: [...existing, value] };
        }

        return { ...c, [name]: [existing, value] };
      }

      return { ...c, [name]: value };
    }, {} as Record<string, string | string[]>) ?? {};

  let valid = options.map((o) => o.split("/").filter((i) => i));
  let params: Record<string, string> = {};
  const split = path.split("/").filter((p) => p);
  for (let i = 0; i < split.length; i++) {
    const segment = split[i];
    for (const option of valid) {
      const part = option[i];
      if (!part) {
        valid = valid.filter((v) => v !== option);
        continue;
      }

      if (part.startsWith("[") && !valid.find((v) => v[i] === segment)) {
        params[part.replace("[", "").replace("]", "")] = segment;
        continue;
      }

      if (part !== segment) {
        valid = valid.filter((v) => v !== option);
      }
    }

    if (valid.length === 0) {
      return [undefined, {}] as const;
    }
  }

  valid = valid.filter((v) => v.length === split.length);

  return ["/" + valid[0].join("/"), { ...query, ...params }] as const;
}
