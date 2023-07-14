import useSuite from "@/hooks/useSuite.ts";
import { type Project } from "@/types/project.ts";
import { useLocation, useNavigate } from "react-router-dom";
import * as classNames from "classnames";

export default function ProjectList() {
  const { suite } = useSuite();

  return (
    <div className={"flex flex-col gap-2"}>
      {suite.projects.map((project) => (
        <ProjectEntry key={project.id} project={project} />
      ))}
    </div>
  );
}

function ProjectEntry({ project }: { project: Project }) {
  const { pathname } = useLocation();
  const opened = pathname.startsWith(`/projects/${project.id}`);
  const navigate = useNavigate();

  return (
    <button
      className={classNames(
        "rounded border border-gray-400 px-4 py-2 cursor-pointer text-left hover:bg-gray-100 flex items-center justify-between",
        {
          "bg-gray-200": opened,
        },
      )}
      onClick={() => {
        navigate(`/projects/${project.id}`);
      }}
    >
      {project.name}
      {opened && <span>⭐️</span>}
    </button>
  );
}
