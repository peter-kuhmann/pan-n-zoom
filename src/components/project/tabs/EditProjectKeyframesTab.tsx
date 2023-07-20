import useProject from "@/hooks/useProject.ts";
import { useCallback, useEffect, useMemo } from "react";
import { type ProjectKeyframe } from "@/types/project.ts";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import * as classNames from "classnames";
import { useParams } from "react-router-dom";
import EditProjectTab from "@/components/project/tabs/EditProjectTab.tsx";
import { useProjectEditorStore } from "@/context/ProjectEditorStore.tsx";
import { useStore } from "zustand";
import { createId } from "@paralleldrive/cuid2";
import getSomeCoolEmojis from "get-some-cool-emojis";
import "./EditProjectKeyframesTab.scss";
import IonIcon from "@/components/IonIcon.tsx";

export default function EditProjectKeyframesTab() {
  const projectId = useParams().projectId;
  const { project, update } = useProject(projectId);

  const projectEditorStore = useProjectEditorStore();
  const { mode, activeKeyframeId, highlightedKeyframeId } =
    useStore(projectEditorStore);

  const addKeyframe = useCallback(
    (index: number) => {
      if (!project) return;

      const newKeyframe: ProjectKeyframe = {
        id: createId(),
        emoji: getSomeCoolEmojis(1),
        x: 0.25,
        y: 0.25,
        width: 0.5,
        height: 0.5,
      };

      const newKeyframes = [...project.keyframes];
      newKeyframes.splice(index, 0, newKeyframe);

      update({
        keyframes: newKeyframes,
      });

      projectEditorStore.setState({
        mode: "createKeyframe",
        activeKeyframeId: newKeyframe.id,
      });
    },
    [project, update, projectEditorStore],
  );

  const deleteKeyframe = useCallback(
    (index: number) => {
      if (!project) return;

      const newKeyframes = [...project.keyframes];
      newKeyframes.splice(index, 1);

      update({
        keyframes: newKeyframes,
      });
    },
    [project, update],
  );

  const moveKeyframe = useCallback(
    (index: number, moveBy: number) => {
      if (!project) return;

      const newKeyframes = [...project.keyframes];
      const [deletedKeyframe] = newKeyframes.splice(index, 1);
      newKeyframes.splice(index + moveBy, 0, deletedKeyframe);

      update({
        keyframes: newKeyframes,
      });
    },
    [project, update],
  );

  const [autoAnimateRef] = useAutoAnimate();

  const activeKeyframeIndex = useMemo<number | null>(() => {
    if (!project) return null;
    return project.keyframes.findIndex((pk) => pk.id === activeKeyframeId);
  }, [project, activeKeyframeId]);

  useEffect(() => {
    if (
      activeKeyframeIndex !== null &&
      (mode === "createKeyframe" || mode === "editKeyframe")
    ) {
      const listener = (e: KeyboardEvent) => {
        if (e.code === "Enter" || e.code === "Escape") {
          if (mode === "createKeyframe") {
            deleteKeyframe(activeKeyframeIndex);
          }

          projectEditorStore.setState({
            mode: "view",
            activeKeyframeId: null,
          });
        }
      };

      document.addEventListener("keydown", listener);

      return () => {
        document.removeEventListener("keydown", listener);
      };
    }
  }, [activeKeyframeIndex, deleteKeyframe, projectEditorStore, mode]);

  const disableAddKeyframeButtons = mode === "createKeyframe";

  if (!project) return <>Project not found.</>;

  return (
    <EditProjectTab title={"Keyframes"}>
      <div className={"h-full flex flex-col gap-4 pb-8"} ref={autoAnimateRef}>
        {project.keyframes.map((keyframe, index) => {
          const editActive =
            mode === "editKeyframe" && activeKeyframeId === keyframe.id;
          const createActive =
            mode === "createKeyframe" && activeKeyframeId === keyframe.id;
          const wiggle = editActive || createActive;

          return (
            <div
              key={`keyframe-${keyframe.id}}`}
              className={"flex flex-col gap-4"}
            >
              <AddKeyframeButton
                disabled={disableAddKeyframeButtons}
                onClick={() => {
                  addKeyframe(index);
                }}
              />
              <Keyframe
                isFirst={index === 0}
                isLast={index === project.keyframes.length - 1}
                onUp={() => {
                  moveKeyframe(index, -1);
                }}
                onDown={() => {
                  moveKeyframe(index, 1);
                }}
                highlighted={
                  mode === "view" && highlightedKeyframeId === keyframe.id
                }
                onHighlightChange={(highlighted) => {
                  if (highlighted) {
                    projectEditorStore.setState({
                      highlightedKeyframeId: keyframe.id,
                    });
                  } else {
                    projectEditorStore.setState({
                      highlightedKeyframeId: null,
                    });
                  }
                }}
                wiggle={wiggle}
                keyframe={keyframe}
                index={index}
                onDelete={() => {
                  deleteKeyframe(index);
                }}
                createActive={createActive}
                editActive={editActive}
                onClick={() => {
                  if (editActive || createActive) {
                    projectEditorStore.setState({
                      mode: "view",
                      activeKeyframeId: null,
                    });
                  } else {
                    projectEditorStore.setState({
                      mode: "editKeyframe",
                      activeKeyframeId: keyframe.id,
                    });
                  }
                }}
              />
            </div>
          );
        })}

        <AddKeyframeButton
          disabled={disableAddKeyframeButtons}
          onClick={() => {
            addKeyframe(project.keyframes.length);
          }}
        />
      </div>
    </EditProjectTab>
  );
}

function AddKeyframeButton({
  onClick,
  disabled,
}: {
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <div className={"flex justify-center"}>
      <button className={"btn btn-xs"} onClick={onClick} disabled={disabled}>
        +
      </button>
    </div>
  );
}

function Keyframe({
  index,
  keyframe,
  onDelete,
  createActive,
  editActive,
  onClick,
  onUp,
  onDown,
  wiggle,
  highlighted,
  onHighlightChange,
  isFirst,
  isLast,
}: {
  keyframe: ProjectKeyframe;
  index: number;
  onDelete: () => void;
  createActive: boolean;
  editActive: boolean;
  onClick: () => void;
  onUp: () => void;
  onDown: () => void;
  highlighted: boolean;
  onHighlightChange?: (highlighted: boolean) => void;
  wiggle: boolean;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => {
        onHighlightChange?.(true);
      }}
      onMouseLeave={() => {
        onHighlightChange?.(false);
      }}
      className={classNames(
        "keyframe",
        "cursor-pointer flex flex-row justify-between items-center px-4 py-1 bg-gray-100 rounded-lg border-2 transition",
        "dark:bg-gray-600",
        {
          "border-blue-400": highlighted && !editActive && !createActive,
          "border-red-400": editActive,
          "border-green-400": createActive,
          "border-transparent": !editActive && !createActive && !highlighted,
          wiggle,
        },
      )}
    >
      <div className={"flex items-center"}>
        <span className={"text-xl mr-4"}>{keyframe.emoji}</span>
        <span className={"text-2xl font-bold"}>{index + 1}</span>
      </div>

      <div className={"flex items-center gap-1"}>
        <button
          disabled={isFirst}
          className={classNames("btn btn-square btn-sm btn-ghost", {
            invisible: isFirst,
          })}
          onClick={(e) => {
            e.stopPropagation();
            onUp();
          }}
        >
          <IonIcon name={"caret-up-outline"} />
        </button>

        <button
          disabled={isLast}
          className={classNames("btn btn-square btn-sm btn-ghost", {
            invisible: isLast,
          })}
          onClick={(e) => {
            e.stopPropagation();
            onDown();
          }}
        >
          <IonIcon name={"caret-down-outline"} />
        </button>

        <button
          className={"btn btn-square btn-sm btn-ghost"}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <IonIcon name={"trash-outline"} />
        </button>
      </div>
    </div>
  );
}
