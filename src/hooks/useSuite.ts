import { type Suite } from "../types/suite.ts";
import {
  getSuite,
  registerSuiteUpdateListener,
  updateSuite,
} from "@/data/suite.ts";
import { useCallback, useEffect, useMemo, useState } from "react";
import { type Project } from "@/types/project.ts";

export interface UseSuite {
  suite: Suite;
  update: (update: Partial<Suite>) => void;
  addProject: (newProject: Project) => void;
  deleteProject: (projectId: string) => void;
}

export default function useSuite(): UseSuite {
  const [suite, setSuite] = useState<Suite>(getSuite());

  useEffect(() => {
    const { unsubscribe } = registerSuiteUpdateListener(setSuite);
    return unsubscribe;
  }, []);

  const addProject = useCallback<(newProject: Project) => void>(
    (newProject) => {
      updateSuite({
        projects: [...suite.projects, newProject],
      });
    },
    [suite],
  );

  const deleteProject = useCallback<(projectId: string) => void>(
    (projectId) => {
      updateSuite({
        projects: suite.projects.filter(
          (suiteProject) => suiteProject.id !== projectId,
        ),
      });
    },
    [suite],
  );

  return useMemo(() => {
    return {
      suite,
      update: updateSuite,
      addProject,
      deleteProject,
    };
  }, [addProject, deleteProject, suite]);
}
