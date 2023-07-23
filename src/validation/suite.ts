import { z } from "zod";
import { ProjectSchema } from "@/validation/project.ts";
import {
  ProjectAnimationDurationSchema,
  ProjectAnimationTypeSchema,
  ProjectBackgroundColorSchema,
  ProjectEmbedSvgNativelySchema,
} from "@/validation/shared.ts";

export const SuiteNewProjectDefaultSettingsSchema = z.object({
  version: z.literal(1),
  backgroundColor: ProjectBackgroundColorSchema,
  embedSvgNatively: ProjectEmbedSvgNativelySchema,
  animationDuration: ProjectAnimationDurationSchema,
  animationType: ProjectAnimationTypeSchema,
});

export const SuiteSchema = z.object({
  projects: z.array(ProjectSchema),
  newProjectDefaultSettings: SuiteNewProjectDefaultSettingsSchema,
});
