import * as classNames from "classnames";
import { useNavigate, useParams } from "react-router-dom";
import IonIcon from "@/components/IonIcon.tsx";
import {
  getProjectListLink,
  getProjectPresentLink,
} from "@/navigation/links.ts";
import useProject from "@/hooks/useProject.ts";
import { useEffect } from "react";
import EditPage from "@/routes/app/project/EditPage.tsx";

export function EditPageLayout() {
  const navigate = useNavigate();
  const projectId = useParams().projectId;
  const { project } = useProject(projectId);
  const presentDisabled = !!project && project.keyframes.length === 0;

  useEffect(() => {
    if (!projectId || !project) {
      navigate(getProjectListLink());
    }
  }, [projectId, project, navigate]);

  if (!projectId || !project) {
    return <>Error: Project not found. Redirecting to overview ...</>;
  }

  return (
    <div
      className={classNames(
        "w-full h-full bg-gray-50 dark:bg-gray-900",
        "flex flex-col",
      )}
    >
      <div
        className={classNames(
          "flex flex-row gap-4 justify-between",
          "px-6 py-4",
        )}
      >
        <button
          className={"btn btn-sm btn-ghost flex items-center gap-4 font-normal"}
          onClick={() => {
            navigate(getProjectListLink());
          }}
        >
          <IonIcon name={"arrow-back-outline"} />
          Leave editor
        </button>

        <button
          disabled={presentDisabled}
          className={
            "btn btn-sm btn-neutral flex items-center gap-4 font-normal"
          }
          onClick={() => {
            navigate(getProjectPresentLink(projectId));
          }}
        >
          Present
          <IonIcon name={"film-outline"} />
        </button>

        <div className={"btn-group-horizontal"}>
          <button className={"btn btn-neutral btn-sm"}>Keyframes</button>
          <button className={"btn btn-sm"}>Settings</button>
        </div>
      </div>

      <div className={"flex-grow h-1 w-full p-6 pt-2"}>
        <div
          className={classNames(
            "w-full h-full rounded-xl shadow-lg border overflow-hidden",
            "bg-white border-gray-200",
            "dark:bg-gray-800 dark:border-gray-400",
            "flex flex-col",
          )}
        >
          <EditPage />
        </div>
      </div>
    </div>
  );
}
