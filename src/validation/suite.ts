import { z } from "zod";
import { ProjectSchema } from "@/validation/project.ts";
import {
  ProjectAnimationDurationSchema,
  ProjectAnimationTypeSchema,
  ProjectBackgroundColorSchema,
  ProjectEmbedSvgNativelySchema,
} from "@/validation/shared.ts";

export const SuiteSchema = z.object({
  projects: z.array(ProjectSchema),
  newProjectDefaultSettings: z.object({
    backgroundColor: ProjectBackgroundColorSchema,
    embedSvgNatively: ProjectEmbedSvgNativelySchema,
    animationDuration: ProjectAnimationDurationSchema,
    animationType: ProjectAnimationTypeSchema,
  }),
});
