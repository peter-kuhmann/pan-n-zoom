import { useEffect, useState } from "react";
import { type DataExport } from "@/types/export.ts";
import SelectDataExportForImport from "@/components/routes/import/SelectDataExportForImport.tsx";
import HandleImportOfDataExport from "@/components/routes/import/HandleImportOfDataExport.tsx";
import { create } from "zustand";

export const useImportPageStore = create<{
  dataExportToPickUp: DataExport | null;
  setDataExportToPickUp: (dataExport: DataExport | null) => void;
}>((set) => {
  return {
    dataExportToPickUp: null,
    setDataExportToPickUp: (dataExport) => {
      set({ dataExportToPickUp: dataExport });
    },
  };
});

export default function ImportPage() {
  const { dataExportToPickUp, setDataExportToPickUp } = useImportPageStore();

  const [dataExport, setDataExport] = useState<DataExport | null>(
    dataExportToPickUp,
  );

  useEffect(() => {
    setDataExportToPickUp(null);
  }, [dataExportToPickUp, setDataExportToPickUp]);

  return dataExport === null ? (
    <SelectDataExportForImport onDataExportRead={setDataExport} />
  ) : (
    <HandleImportOfDataExport
      dataExport={dataExport}
      onBack={() => {
        setDataExport(null);
      }}
    />
  );
}
