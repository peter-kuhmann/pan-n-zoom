import { type Suite } from "@/types/suite.ts";
import { SuiteSchema } from "@/validation/suite.ts";
import { type Project } from "@/types/project.ts";
import { storeImage } from "@/data/imageStorage.ts";
import { createId } from "@paralleldrive/cuid2";

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
  const suite = getSuite();

  await import("./standardProjectDataUrl.ts")
    .then(async (result) => {
      return await storeImage(result.standardProjectDataUrl);
    })
    .then((storedImage) => {
      const standardProject: Project = {
        id: createId(),
        name: "Your Pan'n'Zoom Starter Project 🐈",
        backgroundColor: suite.newProjectDefaultSettings.backgroundColor,
        embedSvgNatively: suite.newProjectDefaultSettings.embedSvgNatively,
        animationDuration: suite.newProjectDefaultSettings.animationDuration,
        animationType: suite.newProjectDefaultSettings.animationType,
        image: {
          fileName: "PanNZoomStarterProject.webp",
          mimeType: "image/webp",
          storageId: storedImage.id,
        },
        keyframes: [
          {
            id: createId(),
            emoji: "🚀",
            x: -0.0027687156593406595,
            y: -0.008584576810176126,
            width: 1.0076783567994505,
            height: 1.0192101883561644,
          },
          {
            id: createId(),
            emoji: "🥳",
            x: 0.13757726648351648,
            y: 0.06094820205479452,
            width: 0.3905069539835165,
            height: 0.32913405088062625,
          },
          {
            id: createId(),
            emoji: "⭐",
            x: 0.4937542925824176,
            y: 0.3179045376712329,
            width: 0.4604760473901099,
            height: 0.36227219911937375,
          },
          {
            id: createId(),
            emoji: "🎬",
            x: 0.053861177884615384,
            y: 0.6100018346379648,
            width: 0.5164835164835164,
            height: 0.3426033512720157,
          },
        ],
        createdAt: new Date().toISOString(),
      };

      updateSuite({
        projects: [...getSuite().projects, standardProject],
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
