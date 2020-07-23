declare module "uglifycss" {
  export function processString(
    content: string,
    options: {
      maxLineLen?: number;
      expandVars?: boolean;
      uglyComments?: boolean;
      cuteComments?: boolean;
      convertUrls?: string;
      debug?: boolean;
    }
  ): string;
}
