import AppPage from "@/components/AppPage.tsx";
import { useCallback, useEffect, useState } from "react";
import { type DataExport } from "@/types/export.ts";
import { fileToUTF8String } from "@/utils/files.ts";
import { DataExportSchema } from "@/validation/export.ts";

export default function ImportPage() {
  const [dataExport, setDataExport] = useState<DataExport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFileSelected = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        setLoading(true);
        const file = e.target.files[0];

        void fileToUTF8String(file)
          .then((rawDataExportContent) => {
            try {
              const rawDataExportJson = JSON.parse(rawDataExportContent);
              const dataExportValidationResult =
                DataExportSchema.safeParse(rawDataExportJson);
              if (!dataExportValidationResult.success) {
                setError(
                  `Data export JSON was malformed: ${dataExportValidationResult.error.message}`,
                );
              } else {
                setDataExport(dataExportValidationResult.data);
              }
            } catch (e) {
              console.error(e);
              setError("Data export was probably invalid JSON.");
            }
          })
          .catch((err) => {
            console.error(err);
            setError(
              "An error occurred while reading the data export as an UTF-8 string.",
            );
          })
          .finally(() => {
            setLoading(false);
          });
      }
    },
    [],
  );

  useEffect(() => {
    if (dataExport) {
      console.log("DE", dataExport);
    }
  }, [dataExport]);

  return (
    <AppPage title={"Import"}>
      <p className={"mb-8 max-w-[40rem]"}>
        Here you can import a the complete suite, including all projects and
        stored images as a JSON file.
      </p>

      {!!error && <p className={"mb-8 max-w-[40rem] text-red-500"}>{error}</p>}

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text text-sm">
            Export file (*.pannzoom.json)
          </span>
        </label>
        <input
          disabled={loading}
          onChange={onFileSelected}
          type="file"
          className="file-input file-input-neutral file-input-bordered w-full max-w-md"
          accept=".json"
        />
      </div>
      {loading && <span className="loading loading-spinner" />}
    </AppPage>
  );
}
