import { useNavigate } from "react-router-dom";
import AppPage from "@/components/AppPage.tsx";
import IonIcon from "@/components/IonIcon.tsx";
import useProjects from "@/hooks/useProjects.ts";
import { getCreateProjectLink, getImportLink } from "@/navigation/links.ts";
import IndexEmptyState from "@/components/routes/IndexEmptyState.tsx";
import IndexProjectOverview from "@/components/routes/IndexProjectOverview.tsx";
import { useCallback, useRef, useState } from "react";
import { DataExportFileSuffix } from "@/utils/export.ts";
import { importDataExport, readDataExportFile } from "@/utils/import.ts";
import { useImportPageStore } from "@/routes/app/import/ImportPage.tsx";
import classNames from "classnames";

export default function IndexPage() {
  const setDataExportToPickUp = useImportPageStore(
    (store) => store.setDataExportToPickUp,
  );
  const [showDrop, setShowDrop] = useState(false);

  const projects = useProjects();
  const navigate = useNavigate();
  const importProjectFileInputRef = useRef<HTMLInputElement | null>(null);

  const startImport = useCallback(() => {
    importProjectFileInputRef.current?.click();
  }, []);

  const importFromFile = useCallback(
    (file: File) => {
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
    },
    [navigate, setDataExportToPickUp],
  );

  const onImportFileSelected = useCallback<
    React.ReactEventHandler<HTMLInputElement>
  >(
    (e) => {
      const file =
        e.currentTarget.files && e.currentTarget.files.length > 0
          ? e.currentTarget.files[0]
          : null;

      if (file) {
        importFromFile(file);
      }
    },
    [importFromFile],
  );

  return (
    <div
      className={"w-full h-full relative"}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();

        setShowDrop(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();

        setShowDrop(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer && e.dataTransfer.files.length > 0) {
          importFromFile(e.dataTransfer.files[0]);
        }

        setShowDrop(false);
      }}
    >
      {/* Drop overlay */}
      <div
        className={classNames(
          "absolute left-0 top-0 w-full h-full z-10",
          "flex flex-row gap-4 items-center justify-center",
          "text-4xl pointer-events-none ",
          {
            "opacity-0": !showDrop,
            "opacity-1 bg-gray-400/20 backdrop-blur-sm": showDrop,
          },
        )}
      >
        <span>Drop file to import</span>
        <IonIcon name={"cloud-upload-outline"} />
      </div>

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
    </div>
  );
}
