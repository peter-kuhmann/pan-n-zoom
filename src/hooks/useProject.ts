import { type Project } from "@/types/project.ts";
import useSuite from "@/hooks/useSuite.ts";
import { useCallback, useMemo } from "react";

export type ProjectUpdater = (
  update: Partial<
    Pick<
      Project,
      | "keyframes"
      | "name"
      | "openedAt"
      | "backgroundColor"
      | "embedSvgNatively"
      | "animationDuration"
      | "animationType"
    >
  >,
) => void;

export default function useProject(projectId?: string): {
  project: Project | null;
  update: ProjectUpdater;
} {
  const { suite, update: updateSuite } = useSuite();

  const project = useMemo<Project | null>(() => {
    if (!projectId) return null;
    return (
      suite.projects.find((suiteProject) => suiteProject.id === projectId) ??
      null
    );
  }, [suite, projectId]);

  const update = useCallback<ProjectUpdater>(
    (update) => {
      if (!project) return;

      updateSuite({
        projects: suite.projects.map((suiteProject) => {
          if (suiteProject.id === project.id) {
            const updatedProject: Project = { ...project, ...update };
            return updatedProject;
          } else {
            return suiteProject;
          }
        }),
      });
    },
    [suite, updateSuite, project],
  );

  return useMemo(() => {
    return {
      project,
      update,
    };
  }, [project, update]);
}
