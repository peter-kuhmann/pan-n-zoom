import { useNavigate } from "react-router-dom";
import AppPage from "@/components/AppPage.tsx";
import IonIcon from "@/components/IonIcon.tsx";
import useProjects from "@/hooks/useProjects.ts";
import { getCreateProjectLink, getImportLink } from "@/navigation/links.ts";
import IndexEmptyState from "@/components/routes/IndexEmptyState.tsx";
import IndexProjectOverview from "@/components/routes/IndexProjectOverview.tsx";
import { useCallback, useRef } from "react";
import { DataExportFileSuffix } from "@/utils/export.ts";
import { importDataExport, readDataExportFile } from "@/utils/import.ts";
import { useImportPageStore } from "@/routes/app/import/ImportPage.tsx";

export default function IndexPage() {
  const setDataExportToPickUp = useImportPageStore(
    (store) => store.setDataExportToPickUp,
  );

  const projects = useProjects();
  const navigate = useNavigate();
  const importProjectFileInputRef = useRef<HTMLInputElement | null>(null);

  const startImport = useCallback(() => {
    importProjectFileInputRef.current?.click();
  }, []);

  const onImportFileSelected = useCallback<
    React.ReactEventHandler<HTMLInputElement>
  >(
    (e) => {
      const file =
        e.currentTarget.files && e.currentTarget.files.length > 0
          ? e.currentTarget.files[0]
          : null;

      if (file) {
        void readDataExportFile(file).then((readResult) => {
          if (readResult.success) {
            const dataExport = readResult.dataExport;

            if (dataExport.type === "suite-export") {
              setDataExportToPickUp(dataExport);
              navigate(getImportLink());
            } else if (dataExport.type === "plain-project-export") {
              void importDataExport(dataExport, {
                projectsImportStrategy: "add",
                newProjectDefaultSettingsStrategy: "ignore",
              });
            }
          }
        });
      }
    },
    [setDataExportToPickUp, navigate],
  );

  return (
    <AppPage
      title={"Projects"}
      actions={
        <div className={"flex items-center gap-4"}>
          <button
            onClick={startImport}
            className={"btn btn-sm btn-neutral btn-outline"}
          >
            Import <IonIcon name={"cloud-upload-outline"} />
          </button>

          <button
            onClick={() => {
              navigate(getCreateProjectLink());
            }}
            className={"btn btn-sm btn-neutral"}
          >
            Create <IonIcon name={"add-outline"} />
          </button>
        </div>
      }
    >
      <input
        type={"file"}
        hidden
        className={"hidden"}
        ref={importProjectFileInputRef}
        accept={DataExportFileSuffix}
        onChange={onImportFileSelected}
      />

      {projects.length > 0 ? (
        <IndexProjectOverview />
      ) : (
        <IndexEmptyState onImport={startImport} />
      )}
    </AppPage>
  );
}
