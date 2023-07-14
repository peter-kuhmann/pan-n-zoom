import { z } from "zod";
import { ProjectSchema } from "@/validation/project.ts";

export const SuiteSchema = z.object({
  projects: z.array(ProjectSchema),
});
