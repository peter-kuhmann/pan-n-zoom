import { type Suite } from "../types/suite.ts";
import { createId } from "@paralleldrive/cuid2";

export default function useSuite(): Suite {
  return {
    id: createId(),
    projects: [],
  };
}
