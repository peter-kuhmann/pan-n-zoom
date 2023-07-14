import { type Suite } from "../types/suite.ts";
import {
  getSuite,
  registerSuiteUpdateListener,
  updateSuite,
} from "@/data/suite.ts";
import { useEffect, useState } from "react";

export interface UseSuite {
  suite: Suite;
  update: (update: Partial<Suite>) => void;
}

export default function useSuite(): UseSuite {
  const [suite, setSuite] = useState<Suite>(getSuite());

  useEffect(() => {
    const { unsubscribe } = registerSuiteUpdateListener(setSuite);
    return unsubscribe;
  }, []);

  return {
    suite,
    update: updateSuite,
  };
}
