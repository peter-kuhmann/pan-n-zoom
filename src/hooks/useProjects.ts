import { type Project } from "@/types/project.ts";
import useSuite from "@/hooks/useSuite.ts";
import { useMemo } from "react";

export default function useProjects(): Project[] {
  const { suite } = useSuite();
  return useMemo(() => suite.projects, [suite]);
}
