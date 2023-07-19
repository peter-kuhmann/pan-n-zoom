import { z } from "zod";

export const ProjectKeyframeSchema = z.object({
  id: z.string(),
  emoji: z.string().nonempty(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
});

export const ProjectSchema = z.object({
  id: z.string().nonempty(),
  name: z.string(),
  backgroundColor: z
    .string()
    .regex(/#[0-9ABCDEFabcdef]{3}([0-9ABCDEFabcdef]{3})?/),
  embedSvgNatively: z.boolean(),
  animationDuration: z.number(),
  animationType: z.enum(["linear", "ease"]),
  image: z.object({
    fileName: z.string(),
    mimeType: z.string(),
    storageId: z.string().nonempty(),
  }),
  keyframes: z.array(ProjectKeyframeSchema),
  createdAt: z.string().datetime(),
  openedAt: z.string().datetime().optional().nullable(),
});
