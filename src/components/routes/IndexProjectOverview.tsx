import { useNavigate } from "react-router-dom";
import { getProjectEditorLink } from "@/navigation/links.ts";
import useProjects from "@/hooks/useProjects.ts";
import useProject from "@/hooks/useProject.ts";
import { useStoredImage } from "@/hooks/useStoredImage.ts";
import { formatDateWithTime } from "@/utils/dates.ts";
import IonIcon from "@/components/IonIcon.tsx";
import useSuite from "@/hooks/useSuite.ts";

export default function IndexProjectOverview() {
  const projects = useProjects();

  return (
    <div>
      <div className={"mb-8"}>
        You currently have {projects.length}{" "}
        {projects.length === 1 ? "project" : "projects"}.
      </div>

      <div className={"flex flex-row gap-x-8 gap-y-6 flex-wrap -mx-4"}>
        {projects.map((project) => (
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
        className={"flex flex-row items-start justify-between gap-4 mt-2 pl-1"}
      >
        <div>
          <div className={"text-2xl"}>{project.name}</div>
          <div className={"text-xs"}>
            {formatDateWithTime(project.openedAt ?? project.createdAt)}
          </div>
        </div>

        <div>
          <div
            className="dropdown dropdown-bottom"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <label tabIndex={0} className="btn btn-ghost btn-sm btn-square">
              <IonIcon name={"ellipsis-vertical"} />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-fit border border-gray-200 -translate-x-1/2"
            >
              <li>
                <button
                  onClick={() => {
                    document.documentElement.blur();
                    deleteProject(projectId);
                  }}
                  className={
                    "btn btn-ghost btn-sm h-auto break-keep whitespace-nowrap"
                  }
                >
                  <span className={"flex flex-row gap-4 items-center"}>
                    <IonIcon name={"trash-outline"} />
                    Delete project
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
