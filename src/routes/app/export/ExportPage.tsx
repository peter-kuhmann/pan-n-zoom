import AppPage from "@/components/AppPage.tsx";
import IonIcon from "@/components/IonIcon.tsx";
import { useCallback, useState } from "react";
import { getSuite } from "@/data/suite.ts";
import { type SuiteDataExport } from "@/types/export.ts";
import {
  downloadDataExport,
  formatNowForDataExportFilename,
  prepareProjectForDataExport,
  validateAndParseRawDataExport,
} from "@/utils/export.ts";

export default function ExportPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportSuite = useCallback(async () => {
    try {
      setLoading(true);

      const suite = getSuite();

      // To have type TS safety
      const rawDataExport: SuiteDataExport = {
        type: "suite-export",
        projects: [],
        newProjectDefaultSettings: suite.newProjectDefaultSettings,
      };

      for (const suiteProject of suite.projects) {
        rawDataExport.projects.push(
          await prepareProjectForDataExport(suiteProject),
        );
      }

      downloadDataExport(
        validateAndParseRawDataExport(rawDataExport),
        `Suite_Export__${formatNowForDataExportFilename()}`,
      );
    } catch (e) {
      setError(`Error: ${e}`);
    } finally {
      setLoading(false);
    }
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
