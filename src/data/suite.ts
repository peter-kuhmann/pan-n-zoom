import { type Suite } from "@/types/suite.ts";
import { SuiteSchema } from "@/validation/suite.ts";
import { DataExportSchema } from "@/validation/export.ts";
import { importDataExport } from "@/utils/import.ts";

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
    newProjectDefaultSettings: {
      version: 1,
      backgroundColor: "#ffffff",
      embedSvgNatively: false,
      animationDuration: 1000,
      animationType: "ease",
    },
  };
  saveSuite(newSuite);

  void addStandardProjectToSuite();

  return newSuite;
}

async function addStandardProjectToSuite() {
  await fetch("/cross-origin/StarterProject.pannzoom")
    .then(async (res) => await res.json())
    .then(async (rawExport) => {
      const dataExport = DataExportSchema.parse(rawExport);
      await importDataExport(dataExport, {
        projectsImportStrategy: "add",
        newProjectDefaultSettingsStrategy: "ignore",
      });
    });
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

  // Let's check updated suite
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

export function dangerousResetSuiteData() {
  localStorage.removeItem(SuiteLocalStorageKey);
}
