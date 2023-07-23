import { z } from "zod";
import { SuiteNewProjectDefaultSettingsSchema } from "@/validation/suite.ts";
import {
  ProjectAnimationDurationSchema,
  ProjectAnimationTypeSchema,
  ProjectBackgroundColorSchema,
  ProjectEmbedSvgNativelySchema,
} from "@/validation/shared.ts";

export const DataExportProjectKeyframeSchema = z.object({
  emoji: z.string().nonempty(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
});

export const DataExportProjectSchema = z.object({
  project: z.object({
    version: z.literal(1),
    name: z.string(),
    backgroundColor: ProjectBackgroundColorSchema,
    embedSvgNatively: ProjectEmbedSvgNativelySchema,
    animationDuration: ProjectAnimationDurationSchema,
    animationType: ProjectAnimationTypeSchema,
    image: z.object({
      fileName: z.string(),
      mimeType: z.string(),
    }),
    keyframes: z.array(DataExportProjectKeyframeSchema),
  }),
  imageDataUrl: z.string().nonempty(),
});

export const PlainProjectsDataExportSchema = z.object({
  type: z.literal("plain-project-export"),
  projects: z.array(DataExportProjectSchema),
});

export const SuiteDataExportSchema = z.object({
  type: z.literal("suite-export"),
  projects: z.array(DataExportProjectSchema),
  newProjectDefaultSettings: SuiteNewProjectDefaultSettingsSchema,
});

export const DataExportSchema = z.discriminatedUnion("type", [
  PlainProjectsDataExportSchema,
  SuiteDataExportSchema,
]);
