import useSuite from "@/hooks/useSuite.ts";
import { type Project } from "@/types/project.ts";
import { useLocation, useNavigate } from "react-router-dom";
import * as classNames from "classnames";
import { type ReactEventHandler, useCallback } from "react";
import { deleteStoredImage } from "@/data/imageStorage.ts";

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
  const { suite, update } = useSuite();
  const { pathname } = useLocation();
  const opened = pathname.startsWith(`/projects/${project.id}`);
  const navigate = useNavigate();

  const deleteProject = useCallback<ReactEventHandler<HTMLButtonElement>>(
    (e) => {
      e.stopPropagation();
      e.preventDefault();

      void deleteStoredImage(project.image.storageId).then(() => {
        update({
          projects: suite.projects.filter(
            (suiteProject) => suiteProject.id !== project.id,
          ),
        });
      });
    },
    [suite, update, project.id],
  );

  return (
    <div
      className={classNames(
        "rounded border border-gray-400 px-4 py-2 cursor-pointer text-left hover:bg-gray-100",
        "flex items-center justify-between",
        {
          "bg-gray-100": opened,
        },
      )}
      onClick={() => {
        navigate(`/projects/${project.id}`);
      }}
    >
      <div className={"flex gap-4"}>
        {project.name}
        {opened && <span>👁️</span>}
      </div>

      <div>
        <button
          className={"hover:bg-red-100 rounded px-2 py-0.5"}
          onClick={deleteProject}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
