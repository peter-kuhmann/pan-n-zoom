import { type SuiteDataExport } from "@/types/export.ts";
import { useCallback, useEffect, useState } from "react";
import AppPage from "@/components/AppPage.tsx";
import { useNavigate } from "react-router-dom";
import { getProjectOverviewLink } from "@/navigation/links.ts";
import {
  importDataExport,
  type ImportDataExportNewProjectDefaultSettingsStrategy,
  type ImportDataExportProjectsImportStrategy,
} from "@/utils/import.ts";

interface HandleImportOfSuiteExportProps {
  dataExport: SuiteDataExport;
  onBack: () => void;
}

export default function HandleImportOfSuiteExport({
  onBack,
  dataExport,
}: HandleImportOfSuiteExportProps) {
  const navigate = useNavigate();

  const [projectsImportStrategy, setProjectsImportStrategy] =
    useState<ImportDataExportProjectsImportStrategy>("add");
  const [
    newProjectDefaultSettingsStrategy,
    setNewProjectDefaultSettingsStrategy,
  ] = useState<ImportDataExportNewProjectDefaultSettingsStrategy>("replace");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const performImport = useCallback(async () => {
    setLoading(true);

    try {
      await importDataExport(dataExport, {
        projectsImportStrategy,
        newProjectDefaultSettingsStrategy,
      });

      setSuccess(true);
      setLoading(false);
    } catch (e) {
      setError(`Unknown error: ${e}`);
      setLoading(false);
    }
  }, [dataExport, projectsImportStrategy, newProjectDefaultSettingsStrategy]);

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

      {!!error && <p className={"mb-8 max-w-[40rem] text-red-500"}>{error}</p>}

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
              e.currentTarget.value as ImportDataExportProjectsImportStrategy,
            );
          }}
        >
          <option value={"add"}>
            Add (keep existing projects + add data export projects)
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
          value={newProjectDefaultSettingsStrategy}
          onChange={(e) => {
            setNewProjectDefaultSettingsStrategy(
              e.currentTarget
                .value as ImportDataExportNewProjectDefaultSettingsStrategy,
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
