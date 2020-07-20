export function ParseQueryString(): { [key: string]: string } {
  const result: { [key: string]: string } = {};
  for (const arg of process.argv) {
    if (arg.startsWith("--")) {
      const [s, o] = arg.split("=");
      if (o.startsWith('"') || o.startsWith("'")) {
        result[s.replace("--", "")] = o.slice(1, o.length - 1);
      }
    }
  }

  return result;
}
