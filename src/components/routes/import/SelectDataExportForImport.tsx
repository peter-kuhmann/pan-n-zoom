import { type DataExport } from "@/types/export.ts";
import { useCallback, useState } from "react";
import AppPage from "@/components/AppPage.tsx";
import { DataExportFileSuffix } from "@/utils/export.ts";
import { readDataExportFile } from "@/types/import.ts";

export interface SelectDataExportForImportProps {
  onDataExportRead: (dataExport: DataExport) => void;
}

export default function SelectDataExportForImport({
  onDataExportRead,
}: SelectDataExportForImportProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFileSelected = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);

      if (e.currentTarget.files && e.currentTarget.files.length > 0) {
        setLoading(true);

        readDataExportFile(e.currentTarget.files[0])
          .then((result) => {
            if (result.success) {
              onDataExportRead(result.dataExport);
            } else {
              setError(result.error);
            }
          })
          .catch((e) => {
            setError(`Unknown error: ${e}`);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    },
    [onDataExportRead],
  );

  return (
    <AppPage title={"Import"}>
      <p className={"mb-8 max-w-[40rem]"}>
        Here you can import a complete suite, including all projects and stored
        images from a JSON file.
      </p>

      {!!error && <p className={"mb-8 max-w-[40rem] text-red-500"}>{error}</p>}

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text text-lg">
            Data export file (*.pannzoom)
          </span>
        </label>
        <input
          disabled={loading}
          onChange={onFileSelected}
          type="file"
          className="file-input file-input-neutral file-input-bordered w-full max-w-md"
          accept={DataExportFileSuffix}
        />
      </div>
      {loading && <span className="loading loading-spinner" />}
    </AppPage>
  );
}
