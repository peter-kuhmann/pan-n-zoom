import { type DataExport } from "@/types/export.ts";
import { useCallback, useState } from "react";
import { fileToUTF8String } from "@/utils/files.ts";
import { DataExportSchema } from "@/validation/export.ts";
import AppPage from "@/components/AppPage.tsx";
import { DataExportFileSuffix } from "@/utils/export.ts";

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

      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];

        if (!file.name.endsWith(DataExportFileSuffix)) {
          setError(
            `The file you selected has an incorrect file suffix (must be ".pannzoom").`,
          );
          e.currentTarget.value = "";
          return;
        }

        setLoading(true);

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
                onDataExportRead(dataExportValidationResult.data);
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
