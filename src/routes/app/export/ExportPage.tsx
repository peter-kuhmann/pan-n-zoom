import AppPage from "@/components/AppPage.tsx";
import IonIcon from "@/components/IonIcon.tsx";
import { useCallback, useState } from "react";
import { getSuite } from "@/data/suite.ts";
import { getStoredImage } from "@/data/imageStorage.ts";
import { DataExportSchema } from "@/validation/export.ts";
import { type SuiteDataExport } from "@/types/export.ts";
import { DataExportFileSuffix } from "@/utils/export.ts";

export default function ExportPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportSuite = useCallback(async () => {
    setLoading(true);

    const suite = getSuite();

    // To have type TS safety
    const rawExportData: SuiteDataExport = {
      type: "suite-export",
      projects: [],
      newProjectDefaultSettings: suite.newProjectDefaultSettings,
    };

    for (const suiteProject of suite.projects) {
      const imageDataUrl = await getStoredImage(suiteProject.image.storageId);

      if (!imageDataUrl) {
        setLoading(false);
        setError(
          `Could not find image for project "${suiteProject.name}" (id = ${suiteProject.id})`,
        );
        return;
      }

      // We want to get rid off all IDs
      rawExportData.projects.push({
        project: {
          version: suiteProject.version,
          name: suiteProject.name,
          backgroundColor: suiteProject.backgroundColor,
          embedSvgNatively: suiteProject.embedSvgNatively,
          animationType: suiteProject.animationType,
          animationDuration: suiteProject.animationDuration,
          image: {
            fileName: suiteProject.image.fileName,
            mimeType: suiteProject.image.mimeType,
          },
          keyframes: suiteProject.keyframes.map((projectKeyframe) => ({
            emoji: projectKeyframe.emoji,
            x: projectKeyframe.x,
            y: projectKeyframe.y,
            width: projectKeyframe.width,
            height: projectKeyframe.height,
          })),
        },
        imageDataUrl,
      });
    }

    const dataExportResult = DataExportSchema.safeParse(rawExportData);

    if (!dataExportResult.success) {
      setError(
        `Constructed data export is invalid: ${dataExportResult.error.message}`,
      );
      setLoading(false);
      return;
    }

    const downloadElement = document.createElement("a");
    downloadElement.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," +
        encodeURIComponent(JSON.stringify(dataExportResult.data, null, 4)),
    );
    downloadElement.setAttribute(
      "download",
      `Pan-n-Zoom-Suite-Export-${new Date().toISOString()}${DataExportFileSuffix}`,
    );

    downloadElement.style.display = "none";
    document.body.appendChild(downloadElement);

    downloadElement.click();

    document.body.removeChild(downloadElement);

    setLoading(false);
  }, []);

  return (
    <AppPage title={"Export"}>
      <div>
        <p className={"mb-8 max-w-[40rem]"}>
          Here you can export the complete suite, including all projects and
          stored images as a JSON file.
        </p>

        <p className={"mb-8 max-w-[40rem]"}>
          You can later import the complete suite or merge the export with an
          existing suite via the "Import" page.
        </p>

        {!!error && (
          <p className={"mb-8 max-w-[40rem] text-red-500"}>{error}</p>
        )}

        <button
          className={"btn btn-neutral"}
          disabled={loading}
          onClick={() => {
            void exportSuite();
          }}
        >
          {loading && <span className="loading loading-spinner" />}
          Export suite <IonIcon name={"cloud-download-outline"} />
        </button>
      </div>
    </AppPage>
  );
}
