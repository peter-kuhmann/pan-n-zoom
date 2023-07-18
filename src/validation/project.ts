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
  name: z.string().nonempty(),
  image: z.object({
    embedSvgNatively: z.boolean(),
    fileName: z.string().nonempty(),
    mimeType: z.string().nonempty(),
    storageId: z.string().nonempty(),
  }),
  keyframes: z.array(ProjectKeyframeSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
