import { UAParser } from "ua-parser-js";

const parser = new UAParser();

export const isMacOs = (parser.getOS().name ?? "")
  .replace(/\s/g, "")
  .toLowerCase()
  .includes("macos");
