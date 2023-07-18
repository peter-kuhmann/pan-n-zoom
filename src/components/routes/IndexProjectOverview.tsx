import { useNavigate } from "react-router-dom";
import { getProjectEditorLink } from "@/navigation/links.ts";
import useProjects from "@/hooks/useProjects.ts";
import useProject from "@/hooks/useProject.ts";
import { useStoredImage } from "@/hooks/useStoredImage.ts";

export default function IndexProjectOverview() {
  const projects = useProjects();

  return (
    <div>
      <div className={"mb-8"}>
        You currently have {projects.length}{" "}
        {projects.length === 1 ? "project" : "projects"}.
      </div>

      <div className={"flex flex-row gap-x-8 gap-y-16 flex-wrap -mx-4"}>
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
  const { project } = useProject(projectId);
  const storedImage = useStoredImage(project?.image.storageId);

  if (!project) {
    return <>Error: Project with ID {projectId} could not be found.</>;
  }

  return (
    <div
      className={
        "w-[15rem] px-4 py-4 hover:bg-gray-100 rounded-lg cursor-pointer transition"
      }
      onClick={() => {
        navigate(getProjectEditorLink(projectId));
      }}
    >
      <div
        className={
          "rounded-md border border-gray-200 w-full h-[8rem] overflow-hidden"
        }
      >
        {storedImage.loading ? (
          <span className="loading loading-spinner loading-md" />
        ) : storedImage.dataUrl ? (
          <img
            src={storedImage.dataUrl}
            className={" object-cover object-top"}
          />
        ) : (
          <div className={"p-2"}>Error: Image data could not be found.</div>
        )}
      </div>

      <div className={"text-2xl mt-2"}>{project.name}</div>
    </div>
  );
}
