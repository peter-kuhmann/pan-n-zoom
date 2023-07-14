import { type ProjectSchema } from "@/validation/project.ts";
import { type z } from "zod";

export type Project = z.infer<typeof ProjectSchema>;
