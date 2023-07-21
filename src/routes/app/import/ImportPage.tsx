import { useState } from "react";
import { type DataExport } from "@/types/export.ts";
import SelectDataExportForImport from "@/components/routes/import/SelectDataExportForImport.tsx";
import HandleImportOfSuiteExport from "@/components/routes/import/HandleImportOfSuiteExport.tsx";

export default function ImportPage() {
  const [dataExport, setDataExport] = useState<DataExport | null>(null);

  return dataExport === null ? (
    <SelectDataExportForImport onDataExportRead={setDataExport} />
  ) : (
    <HandleImportOfSuiteExport
      dataExport={dataExport}
      onBack={() => {
        setDataExport(null);
      }}
    />
  );
}
