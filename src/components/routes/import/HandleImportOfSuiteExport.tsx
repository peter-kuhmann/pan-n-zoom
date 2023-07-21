import { type DataExport } from "@/types/export.ts";
import { useCallback, useEffect, useState } from "react";
import AppPage from "@/components/AppPage.tsx";
import { useNavigate } from "react-router-dom";
import { getProjectOverviewLink } from "@/navigation/links.ts";
import useSuite from "@/hooks/useSuite.ts";
import { deleteStoredImage, storeImage } from "@/data/imageStorage.ts";
import { type Suite } from "@/types/suite.ts";
import { createId } from "@paralleldrive/cuid2";
import { type Project } from "@/types/project.ts";

interface HandleImportOfSuiteExportProps {
  dataExport: DataExport;
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
  const [error, setError] = useState<string | null>(null);
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
      for (const projectToImport of dataExport.suite.projects) {
        const correspondingImageToImport = dataExport.imageStorage.images.find(
          (image) => image.id === projectToImport.image.storageId,
        );

        if (!correspondingImageToImport) {
          setError(
            `Could not find corresponding image in data export for data export project with ID ${projectToImport.id} and name "${projectToImport.name}".`,
          );
          setLoading(false);
          return;
        }

        const newStoredImage = await storeImage(
          correspondingImageToImport.dataUrl,
        );

        const project: Project = {
          ...projectToImport,
          id: createId(),
          image: {
            ...projectToImport.image,
            storageId: newStoredImage.id,
          },
        };

        newSuite.projects.push(project);
      }
    }

    // Handle suite settings
    if (suiteSettingsImportStrategy === "replace") {
      newSuite.newProjectDefaultSettings =
        dataExport.suite.newProjectDefaultSettings;
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
    dataExport.suite.projects.length === 1
      ? "1 project"
      : `${dataExport.suite.projects.length} projects`;

  const imagesAmountText =
    dataExport.imageStorage.images.length === 1
      ? "1 image"
      : `${dataExport.imageStorage.images.length} images`;

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

      {!!error && <p className={"mb-8 max-w-[40rem] text-red-500"}>{error}</p>}

      <p className={"mb-8 max-w-[40rem]"}>
        You are about to import a <b>complete suite.</b> Please set the import
        settings below.
      </p>

      <p className={"mb-8 max-w-[40rem]"}>
        The data export has <b>{projectsAmountText}</b> and{" "}
        <b>{imagesAmountText}</b>.
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
