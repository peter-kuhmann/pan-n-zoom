import { type z } from "zod";
import {
  type DataExportSchema,
  type PlainProjectsDataExportSchema,
  type SuiteDataExportSchema,
} from "@/validation/export.ts";

export type DataExport = z.infer<typeof DataExportSchema>;

export type SuiteDataExport = z.infer<typeof SuiteDataExportSchema>;

export type PlainProjectsDataExport = z.infer<
  typeof PlainProjectsDataExportSchema
>;
