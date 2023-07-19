import { type Suite } from "@/types/suite.ts";
import { SuiteSchema } from "@/validation/suite.ts";

const SuiteLocalStorageKey = "pan-n-zoom-suite";

function getStoredSuiteOrThrow(): Suite | null {
  const storedSuite = localStorage.getItem(SuiteLocalStorageKey);
  if (!storedSuite) {
    return null;
  }

  let parsedJson: any = null;
  try {
    parsedJson = JSON.parse(storedSuite);
  } catch (e) {
    console.error("Error when parsing suite localStorage raw string.", e);
    return null;
  }

  const validationResult = SuiteSchema.safeParse(parsedJson);
  if (!validationResult.success) {
    console.error(
      "Validating suite JSON failed:",
      validationResult.error.message,
    );
    return null;
  }

  return validationResult.data;
}

function saveSuite(suite: Suite) {
  localStorage.setItem(SuiteLocalStorageKey, JSON.stringify(suite));
}

function createSuite(): Suite {
  const newSuite: Suite = {
    projects: [],
  };
  saveSuite(newSuite);
  return newSuite;
}

export function getSuite(): Suite {
  let suite = getStoredSuiteOrThrow();
  if (!suite) {
    suite = createSuite();
  }
  return suite;
}

export function updateSuite(update: Partial<Suite>): Suite {
  const rawNewSuiteState: Suite = { ...getSuite(), ...update };

  // Let's check udpated suite
  const parseResult = SuiteSchema.safeParse(rawNewSuiteState);
  if (!parseResult.success) {
    throw new Error("Updating suite failed: " + parseResult.error.message);
  }

  const newSuiteState = parseResult.data;

  saveSuite(newSuiteState);

  suiteUpdateListeners.forEach((listener) => {
    listener(newSuiteState);
  });

  return newSuiteState;
}

export type SuiteUpdateListener = (updatedSuite: Suite) => void;

const suiteUpdateListeners = new Set<SuiteUpdateListener>();

export function registerSuiteUpdateListener(listener: SuiteUpdateListener): {
  unsubscribe: () => void;
} {
  if (suiteUpdateListeners.has(listener)) {
    throw new Error("Listener already registered.");
  }

  suiteUpdateListeners.add(listener);

  return {
    unsubscribe: () => {
      suiteUpdateListeners.delete(listener);
    },
  };
}
