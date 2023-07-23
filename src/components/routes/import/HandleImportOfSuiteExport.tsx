import { type SuiteDataExport } from "@/types/export.ts";
import { useCallback, useEffect, useState } from "react";
import AppPage from "@/components/AppPage.tsx";
import { useNavigate } from "react-router-dom";
import { getProjectOverviewLink } from "@/navigation/links.ts";
import useSuite from "@/hooks/useSuite.ts";
import { deleteStoredImage, storeImage } from "@/data/imageStorage.ts";
import { type Suite } from "@/types/suite.ts";
import { createId } from "@paralleldrive/cuid2";
import { type Project, type ProjectKeyframe } from "@/types/project.ts";

interface HandleImportOfSuiteExportProps {
  dataExport: SuiteDataExport;
  onBack: () => void;
}

type ProjectsImportStrategy = "add" | "replace" | "ignore";
type SuiteSettingsImportStrategy = "replace" | "ignore";

export default function HandleImportOfSuiteExport({
  onBack,
  dataExport,
}: HandleImportOfSuiteExportProps) {
  const { suite, update } = useSuite();
  const navigate = useNavigate();

  const [projectsImportStrategy, setProjectsImportStrategy] =
    useState<ProjectsImportStrategy>("add");
  const [suiteSettingsImportStrategy, setSuiteSettingsImportStrategy] =
    useState<SuiteSettingsImportStrategy>("replace");
  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const performImport = useCallback(async () => {
    setLoading(true);

    const newSuite: Suite = { ...suite };

    // Handle projects and images
    if (projectsImportStrategy === "replace") {
      // delete existing projects from suite
      const oldImagesToDelete = suite.projects.map(
        (project) => project.image.storageId,
      );

      newSuite.projects = [];

      // We also need to delete the stored images
      await Promise.all(
        oldImagesToDelete.map(async (storageId) => {
          await deleteStoredImage(storageId);
        }),
      );
    }

    if (projectsImportStrategy !== "ignore") {
      // Now we import the projects + images one by one (and assign new IDs for the projects and images)
      for (const projectExport of dataExport.projects) {
        const newStoredImage = await storeImage(projectExport.imageDataUrl);

        const project: Project = {
          ...projectExport.project,
          id: createId(),
          image: {
            ...projectExport.project.image,
            storageId: newStoredImage.id,
          },
          keyframes: projectExport.project.keyframes.map((keyframeToImport) => {
            const newKeyframe: ProjectKeyframe = {
              ...keyframeToImport,
              id: createId(),
            };

            return newKeyframe;
          }),
          createdAt: new Date().toISOString(),
        };

        newSuite.projects.push(project);
      }
    }

    // Handle suite settings
    if (suiteSettingsImportStrategy === "replace") {
      newSuite.newProjectDefaultSettings = dataExport.newProjectDefaultSettings;
    }

    update(newSuite);

    setSuccess(true);
    setLoading(false);
  }, [
    suite,
    update,
    dataExport,
    projectsImportStrategy,
    suiteSettingsImportStrategy,
  ]);

  const projectsAmountText =
    dataExport.projects.length === 1
      ? "1 project"
      : `${dataExport.projects.length} projects`;

  useEffect(() => {
    if (success) {
      const timeout = setTimeout(() => {
        navigate(getProjectOverviewLink());
      }, 2000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [success, navigate]);

  const disableImport = loading || success;

  return (
    <AppPage
      title={"Suite Import"}
      backTo={{ label: "Pick an other file to import", to: onBack }}
    >
      {success && (
        <p className={"mb-8 max-w-[40rem] text-green-500"}>
          The import succeeded. You will be redirected to the project
          overview...
        </p>
      )}

      {/* {!!error && <p className={"mb-8 max-w-[40rem] text-red-500"}>{error}</p>} */}

      <p className={"mb-8 max-w-[40rem]"}>
        You are about to import a <b>complete suite.</b> Please set the import
        settings below.
      </p>

      <p className={"mb-8 max-w-[40rem]"}>
        The data export has <b>{projectsAmountText}</b>.
      </p>

      <hr className={"mb-8"} />

      <div className="form-control w-full mb-8">
        <label className="label">
          <span className="label-text text-lg">Projects import strategy</span>
        </label>
        <select
          disabled={disableImport}
          className="select select-bordered w-full"
          value={projectsImportStrategy}
          onChange={(e) => {
            setProjectsImportStrategy(
              e.currentTarget.value as ProjectsImportStrategy,
            );
          }}
        >
          <option value={"merge"}>
            Merge (keep existing projects + add data export projects)
          </option>
          <option value={"replace"}>
            Replace (delete existing projects + add data export projects)
          </option>
          <option value={"ignore"}>
            Ignore (keep existing projects + don't add data export projects)
          </option>
        </select>
      </div>

      <div className="form-control w-full mb-8">
        <label className="label">
          <span className="label-text text-lg">
            Suite settings import strategy
          </span>
        </label>
        <select
          disabled={disableImport}
          className="select select-bordered w-full "
          value={suiteSettingsImportStrategy}
          onChange={(e) => {
            setSuiteSettingsImportStrategy(
              e.currentTarget.value as SuiteSettingsImportStrategy,
            );
          }}
        >
          <option value={"replace"}>
            Replace (replace settings by data export settings)
          </option>
          <option value={"ignore"}>Ignore (keep existing settings)</option>
        </select>
      </div>

      <button
        className={"btn btn-neutral"}
        disabled={disableImport}
        onClick={() => {
          void performImport();
        }}
      >
        {loading && <span className="loading loading-spinner" />}
        Perform import
      </button>
    </AppPage>
  );
}
