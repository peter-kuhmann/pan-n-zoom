import useProject from "@/hooks/useProject.ts";
import { useCallback, useMemo } from "react";
import { type ProjectKeyframe } from "@/types/project.ts";

export type ProjectKeyframeUpdater = (
  keyframeUpdate: Partial<
    Pick<ProjectKeyframe, "x" | "y" | "width" | "height">
  >,
) => void;

export default function useProjectKeyframe(
  projectId?: string | null,
  keyframeId?: string | null,
) {
  const { project, update: updateProject } = useProject(projectId ?? undefined);

  const keyframe = useMemo<ProjectKeyframe | null>(() => {
    if (!project) return null;
    if (!keyframeId) return null;
    return (
      project.keyframes.find(
        (projectKeyframe) => projectKeyframe.id === keyframeId,
      ) ?? null
    );
  }, [project, keyframeId]);

  const update = useCallback<ProjectKeyframeUpdater>(
    (keyframeUpdate) => {
      if (!project) return;

      updateProject({
        keyframes: project.keyframes.map((projectKeyframe) => {
          if (projectKeyframe.id === keyframeId) {
            const updatedKeyframe: ProjectKeyframe = {
              ...projectKeyframe,
              ...keyframeUpdate,
            };
            return updatedKeyframe;
          } else {
            return projectKeyframe;
          }
        }),
      });
    },
    [project, updateProject, keyframeId],
  );

  return {
    keyframe,
    update,
  };
}
