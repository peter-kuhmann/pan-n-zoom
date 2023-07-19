import * as classNames from "classnames";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import IonIcon from "@/components/IonIcon.tsx";
import {
  getProjectEditorLink,
  getProjectEditorSettingsLink,
  getProjectListLink,
  getProjectPresentLink,
} from "@/navigation/links.ts";
import useProject from "@/hooks/useProject.ts";
import { useEffect } from "react";
import {
  ProjectEditorStoreProvider,
  useCreateProjectEditorStore,
} from "@/context/ProjectEditorStore.tsx";
import EditProjectCanvas from "@/components/EditProjectCanvas.tsx";

export function EditProjectPageLayout() {
  const projectEditorStore = useCreateProjectEditorStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();

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
    <ProjectEditorStoreProvider store={projectEditorStore}>
      <div
        className={classNames(
          "w-full h-full bg-gray-50 dark:bg-gray-900",
          "flex flex-col",
        )}
      >
        <div
          className={classNames(
            "flex flex-row gap-8 justify-between items-center",
            "px-6 py-4",
          )}
        >
          <button
            className={
              "btn btn-sm btn-ghost flex items-center gap-2 font-normal"
            }
            onClick={() => {
              navigate(getProjectListLink());
            }}
          >
            <IonIcon name={"arrow-back-outline"} />
            Leave editor
          </button>

          <div className={"flex-grow w-1 flex justify-center items-center"}>
            {project.name}
          </div>

          <div className={"flex flex-row items-center gap-8"}>
            <button
              disabled={presentDisabled}
              className={
                "btn btn-sm btn-neutral flex items-center gap-2 font-normal"
              }
              onClick={() => {
                navigate(getProjectPresentLink(projectId));
              }}
            >
              <IonIcon name={"film-outline"} />
              Present
            </button>

            <div className={"btn-group-horizontal flex flex-row items-center"}>
              <button
                className={classNames(
                  "btn btn-sm inline-flex items-center gap-2 font-normal",
                  {
                    "btn-neutral": pathname === getProjectEditorLink(projectId),
                  },
                )}
                onClick={() => {
                  navigate(getProjectEditorLink(projectId));
                }}
              >
                <IonIcon name={"layers-outline"} />
                Keyframes
              </button>

              <button
                className={classNames(
                  "btn btn-sm inline-flex items-center gap-2 font-normal",
                  {
                    "btn-neutral":
                      pathname === getProjectEditorSettingsLink(projectId),
                  },
                )}
                onClick={() => {
                  navigate(getProjectEditorSettingsLink(projectId));
                }}
              >
                <IonIcon name={"cog-outline"} />
                Settings
              </button>
            </div>
          </div>
        </div>

        <div className={"flex-grow h-1 w-full p-6 pt-2 flex flex-row gap-6"}>
          <div
            className={classNames(
              "flex-grow w-1 h-full rounded-xl shadow-lg border overflow-hidden",
              "bg-white border-gray-200",
              "dark:bg-gray-800 dark:border-gray-400",
            )}
          >
            <EditProjectCanvas projectId={projectId} />
          </div>

          <div
            className={classNames(
              "h-full rounded-xl shadow-lg border overflow-hidden",
              "bg-white border-gray-200",
              "dark:bg-gray-800 dark:border-gray-400",
            )}
          >
            <Outlet />
          </div>
        </div>
      </div>
    </ProjectEditorStoreProvider>
  );
}
