import {
  type ProjectKeyframeSchema,
  type ProjectSchema,
} from "@/validation/project.ts";
import { type z } from "zod";

export type ProjectKeyframe = z.infer<typeof ProjectKeyframeSchema>;

export type Project = z.infer<typeof ProjectSchema>;
