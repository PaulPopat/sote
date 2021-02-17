type SetCookiesData = {
  value: string;
  expires: Date;
  secure?: boolean;
  http_only?: boolean;
};

export function ParseCookies(headers: Headers) {
  const cookies = headers
    .get("Cookie")
    ?.split("; ")
    .map((c) => c.split("="))
    .reduce(
      (c, [name, value]) => ({ ...c, [name.trim()]: value.trim() }),
      {} as Record<string, string>
    );

  const to_set = {} as Record<string, SetCookiesData[]>;
  return {
    Get(key: string) {
      if (!cookies) {
        return undefined;
      }

      return cookies[key];
    },
    Set(key: string, value: SetCookiesData) {
      to_set[key] = [...(to_set[key] ?? []), value];
    },
    /**
     * THIS IS NOT PURE! The inputed headers will be mutated.
     * The return is just for easy chaining.
     */
    Apply(headers: Headers) {
      for (const name in to_set) {
        for (const cookie of to_set[name]) {
          let cookie_string = `${name}=${
            cookie.value
          }; Expires=${cookie.expires.toUTCString()};`;
          if (cookie.secure) {
            cookie_string += " Secure;";
          }

          if (cookie.http_only) {
            cookie_string += " HttpOnly;";
          }

          headers.append("Set-Cookie", cookie_string);
        }
      }

      return headers;
    },
  };
}
