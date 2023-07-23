import { z } from "zod";
import {
  ProjectAnimationDurationSchema,
  ProjectAnimationTypeSchema,
  ProjectBackgroundColorSchema,
  ProjectEmbedSvgNativelySchema,
} from "@/validation/shared.ts";

export const ProjectKeyframeSchema = z.object({
  id: z.string(),
  emoji: z.string().nonempty(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
});

export const ProjectSchema = z.object({
  version: z.literal(1),
  id: z.string().nonempty(),
  name: z.string(),
  backgroundColor: ProjectBackgroundColorSchema,
  embedSvgNatively: ProjectEmbedSvgNativelySchema,
  animationDuration: ProjectAnimationDurationSchema,
  animationType: ProjectAnimationTypeSchema,
  image: z.object({
    fileName: z.string(),
    mimeType: z.string(),
    storageId: z.string().nonempty(),
  }),
  keyframes: z.array(ProjectKeyframeSchema),
  createdAt: z.string().datetime(),
  openedAt: z.string().datetime().optional().nullable(),
});
