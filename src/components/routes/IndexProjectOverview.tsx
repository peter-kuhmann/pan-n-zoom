import { useNavigate } from "react-router-dom";
import {
  getProjectEditorLink,
  getProjectPresentLink,
} from "@/navigation/links.ts";
import useProjects from "@/hooks/useProjects.ts";
import useProject from "@/hooks/useProject.ts";
import { useStoredImage } from "@/hooks/useStoredImage.ts";
import { formatDateWithTime } from "@/utils/dates.ts";
import IonIcon from "@/components/IonIcon.tsx";
import useSuite from "@/hooks/useSuite.ts";
import { useCallback, useMemo } from "react";
import { type Project } from "@/types/project.ts";
import {
  downloadDataExport,
  formatNowForDataExportFilename,
  prepareProjectForDataExport,
  validateAndParseRawDataExport,
} from "@/utils/export.ts";
import { type PlainProjectsDataExport } from "@/types/export.ts";
import SKC from "@/components/SKC.tsx";

export default function IndexProjectOverview() {
  const projects = useProjects();

  const sortedProjects = useMemo<Project[]>(() => {
    return projects.sort((a, b) => {
      return (
        new Date(b.openedAt ?? b.createdAt).getTime() -
        new Date(a.openedAt ?? a.createdAt).getTime()
      );
    });
  }, [projects]);

  return (
    <div>
      <div className={"mb-8 leading-relaxed"}>
        <b>
          You currently have {sortedProjects.length}{" "}
          {sortedProjects.length === 1 ? "project" : "projects"}.
        </b>
        <span className={"w-8 inline-block"} />
        You can drop image files or Pan'n'Zoom exports here. Use{" "}
        <SKC small keys={["#PCTRL", "V"]} /> to paste an image.
      </div>

      <div className={"flex flex-row gap-x-8 gap-y-6 flex-wrap -mx-4"}>
        {sortedProjects.map((project) => (
          <ProjectEntry projectId={project.id} key={project.id} />
        ))}
      </div>
    </div>
  );
}

interface ProjectEntryProps {
  projectId: string;
}

function ProjectEntry({ projectId }: ProjectEntryProps) {
  const navigate = useNavigate();
  const { deleteProject } = useSuite();
  const { project } = useProject(projectId);
  const storedImage = useStoredImage(project?.image.storageId);

  const exportProject = useCallback(async () => {
    if (!project) return;

    const dataExportProject = await prepareProjectForDataExport(project);

    const rawDataExport: PlainProjectsDataExport = {
      type: "plain-project-export",
      projects: [dataExportProject],
    };

    downloadDataExport(
      validateAndParseRawDataExport(rawDataExport),
      `${project.name} – ${formatNowForDataExportFilename()}`,
    );
  }, [project]);

  if (!project) {
    return <>Error: Project with ID {projectId} could not be found.</>;
  }

  return (
    <div
      className={
        "w-[20rem] px-4 py-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition"
      }
      onClick={() => {
        navigate(getProjectEditorLink(projectId));
      }}
    >
      <div
        className={
          "rounded-md border border-gray-200 w-full h-[10rem] overflow-hidden"
        }
      >
        {storedImage.loading ? (
          <span className="loading loading-spinner loading-md" />
        ) : storedImage.dataUrl ? (
          <img
            src={storedImage.dataUrl}
            className={"object-cover object-top"}
          />
        ) : (
          <div className={"p-2"}>Error: Image data could not be found.</div>
        )}
      </div>

      <div
        className={"flex flex-row items-start justify-between gap-4 mt-3 pl-2"}
      >
        <div>
          <div className={"text-xl"}>{project.name}</div>
          <div className={"text-xs"}>
            {formatDateWithTime(project.openedAt ?? project.createdAt)}
          </div>
        </div>

        <div
          className={"flex flex-row items-center justify-between pr-1 gap-1"}
        >
          <button
            className={"btn btn-ghost btn-xs btn-square"}
            onClick={(e) => {
              e.stopPropagation();
              navigate(getProjectPresentLink(projectId));
            }}
          >
            <IonIcon name={"play"} />
          </button>

          <div
            className="dropdown dropdown-bottom"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <label tabIndex={0} className="btn btn-ghost btn-xs btn-square">
              <IonIcon name={"ellipsis-vertical"} />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-fit border border-gray-200 -translate-x-1/2"
            >
              <li>
                <button
                  onClick={() => {
                    (document.activeElement as HTMLElement | undefined)?.blur();
                    deleteProject(projectId);
                  }}
                  className={
                    "btn btn-ghost btn-sm h-auto break-keep whitespace-nowrap justify-start"
                  }
                >
                  <span
                    className={"flex flex-row gap-4 items-center justify-start"}
                  >
                    <IonIcon name={"trash-outline"} />
                    Delete project
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    (document.activeElement as HTMLElement | undefined)?.blur();
                    void exportProject();
                  }}
                  className={
                    "btn btn-ghost btn-sm h-auto break-keep whitespace-nowrap justify-start"
                  }
                >
                  <span
                    className={"flex flex-row gap-4 items-center justify-start"}
                  >
                    <IonIcon name={"cloud-download-outline"} />
                    Export
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
