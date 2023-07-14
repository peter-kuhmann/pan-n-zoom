import { type z } from "zod";
import { type SuiteSchema } from "@/validation/suite.ts";

export type Suite = z.infer<typeof SuiteSchema>;
