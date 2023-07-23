import { useNavigate } from "react-router-dom";
import AppPage from "@/components/AppPage.tsx";
import IonIcon from "@/components/IonIcon.tsx";
import useProjects from "@/hooks/useProjects.ts";
import {
  getCreateProjectLink,
  getImportLink,
  getProjectEditorLink,
} from "@/navigation/links.ts";
import IndexEmptyState from "@/components/routes/IndexEmptyState.tsx";
import IndexProjectOverview from "@/components/routes/IndexProjectOverview.tsx";
import { useCallback, useRef, useState } from "react";
import { DataExportFileSuffix } from "@/utils/export.ts";
import { importDataExport, readDataExportFile } from "@/utils/import.ts";
import { useImportPageStore } from "@/routes/app/import/ImportPage.tsx";
import classNames from "classnames";
import { storeImage } from "@/data/imageStorage.ts";
import { type Project } from "@/types/project.ts";
import { createId } from "@paralleldrive/cuid2";
import { fileToDataUrl } from "@/utils/files.ts";
import useSuite from "@/hooks/useSuite.ts";

export default function IndexPage() {
  const setDataExportToPickUp = useImportPageStore(
    (store) => store.setDataExportToPickUp,
  );
  const [showDrop, setShowDrop] = useState(false);

  const { suite, addProject } = useSuite();
  const projects = useProjects();
  const navigate = useNavigate();
  const importProjectFileInputRef = useRef<HTMLInputElement | null>(null);

  const startImport = useCallback(() => {
    importProjectFileInputRef.current?.click();
  }, []);

  const importFromFile = useCallback(
    async (file: File) => {
      if (file.name.endsWith(DataExportFileSuffix)) {
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
      } else if (file.type.startsWith("image/")) {
        const dataUrl = await fileToDataUrl(file);
        const storedImage = await storeImage(dataUrl);

        const newProject: Project = {
          version: 1,
          id: createId(),
          name: `New Project #${suite.projects.length + 2}`,
          backgroundColor: suite.newProjectDefaultSettings.backgroundColor,
          embedSvgNatively: suite.newProjectDefaultSettings.embedSvgNatively,
          animationDuration: suite.newProjectDefaultSettings.animationDuration,
          animationType: suite.newProjectDefaultSettings.animationType,
          image: {
            fileName: file.name,
            mimeType: file.type,
            storageId: storedImage.id,
          },
          keyframes: [],
          createdAt: new Date().toISOString(),
        };

        addProject(newProject);
        navigate(getProjectEditorLink(newProject.id));
      }
    },
    [suite, navigate, addProject, setDataExportToPickUp],
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
          void importFromFile(e.dataTransfer.files[0]);
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
            "opacity-1 bg-white/90 dark:bg-gray-800/90": showDrop,
          },
        )}
      >
        <span>Drop an image file or Pan'n'Zoom export here</span>
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
          onChange={(e) => {
            const file =
              e.currentTarget.files && e.currentTarget.files.length > 0
                ? e.currentTarget.files[0]
                : null;

            if (file) {
              void importFromFile(file);
            }
          }}
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
