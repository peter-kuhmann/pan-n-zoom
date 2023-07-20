import { z } from "zod";

export const ProjectBackgroundColorSchema = z
  .string()
  .regex(/#[0-9ABCDEFabcdef]{3}([0-9ABCDEFabcdef]{3})?/);
export const ProjectEmbedSvgNativelySchema = z.boolean();
export const ProjectAnimationDurationSchema = z.number();
export const ProjectAnimationTypeSchema = z.enum(["linear", "ease"]);
