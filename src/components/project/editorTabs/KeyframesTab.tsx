import useProject from "@/hooks/useProject.ts";
import { useCallback } from "react";
import { type ProjectKeyframe } from "@/types/project.ts";
import { createId } from "@paralleldrive/cuid2";
import getSomeCoolEmojis from "get-some-cool-emojis";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export default function KeyframesTab({ projectId }: { projectId: string }) {
  const { project, update } = useProject(projectId);

  const addKeyframe = useCallback(
    (index: number) => {
      if (!project) return;

      const newKeyframe: ProjectKeyframe = {
        id: createId(),
        emoji: getSomeCoolEmojis(1),
        x: 0,
        y: 0,
        width: 0.5,
        height: 0.5,
      };

      const newKeyframes = [...project.keyframes];
      newKeyframes.splice(index, 0, newKeyframe);

      update({
        keyframes: newKeyframes,
      });
    },
    [project, update],
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

  const [autoAnimateRef] = useAutoAnimate();

  if (!project) return <>Project not found.</>;

  return (
    <div
      className={"h-full flex flex-col gap-4 overflow-x-scroll pb-8"}
      ref={autoAnimateRef}
    >
      {project.keyframes.map((keyframe, index) => {
        return (
          <div key={`lol-${keyframe.id}}`} className={"flex flex-col gap-4"}>
            <AddKeyframeButton
              onClick={() => {
                addKeyframe(index);
              }}
            />
            <Keyframe
              keyframe={keyframe}
              index={index}
              onDelete={() => {
                deleteKeyframe(index);
              }}
            />
          </div>
        );
      })}

      <AddKeyframeButton
        onClick={() => {
          addKeyframe(project.keyframes.length);
        }}
      />
    </div>
  );
}

function AddKeyframeButton({ onClick }: { onClick: () => void }) {
  return (
    <div className={"flex justify-center"}>
      <button className={"btn btn-xs"} onClick={onClick}>
        +
      </button>
    </div>
  );
}

function Keyframe({
  index,
  keyframe,
  onDelete,
}: {
  keyframe: ProjectKeyframe;
  index: number;
  onDelete: () => void;
}) {
  return (
    <div
      className={
        "flex flex-row justify-between items-center px-4 py-1 bg-gray-100 rounded-lg"
      }
    >
      <div className={"flex items-center"}>
        <span className={"text-xl mr-4"}>{keyframe.emoji}</span>
        <span className={"text-2xl font-bold"}>{index + 1}</span>
      </div>

      <button
        className={"hover:bg-red-100 rounded px-2 py-0.5"}
        onClick={onDelete}
      >
        🗑️
      </button>
    </div>
  );
}
