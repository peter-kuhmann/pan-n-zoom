import AppPage from "@/components/AppPage.tsx";
import IonIcon from "@/components/IonIcon.tsx";
import { useCallback, useState } from "react";
import { getSuite } from "@/data/suite.ts";
import { getStoredImage } from "@/data/imageStorage.ts";
import { DataExportSchema } from "@/validation/export.ts";
import { type z } from "zod";

export default function ExportPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportSuite = useCallback(async () => {
    setLoading(true);

    const suite = getSuite();
    const imageIds = suite.projects.map((project) => project.image.storageId);

    const storedImages: Array<{ id: string; dataUrl: string }> = [];
    for (const imageId of imageIds) {
      const dataUrl = await getStoredImage(imageId);

      if (!dataUrl) {
        setError(`Could not find image data for image ID ${imageId}`);
        setLoading(false);
        return;
      }

      storedImages.push({ id: imageId, dataUrl });
    }

    // To have type TS safety
    const rawExportData: z.input<typeof DataExportSchema> = {
      suite,
      imageStorage: {
        images: storedImages,
      },
    };

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
        encodeURIComponent(JSON.stringify(dataExportResult.data)),
    );
    downloadElement.setAttribute(
      "download",
      `Pan-n-Zoom-Suite-Export-${new Date().toISOString()}.json`,
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
