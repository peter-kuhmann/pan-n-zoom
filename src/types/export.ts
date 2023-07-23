import { type z } from "zod";
import {
  type DataExportNewProjectDefaultSettingsSchema,
  type DataExportProjectSchema,
  type DataExportSchema,
  type PlainProjectsDataExportSchema,
  type SuiteDataExportSchema,
} from "@/validation/export.ts";

export type DataExport = z.infer<typeof DataExportSchema>;

export type SuiteDataExport = z.infer<typeof SuiteDataExportSchema>;

export type PlainProjectsDataExport = z.infer<
  typeof PlainProjectsDataExportSchema
>;

export type DataExportProject = z.infer<typeof DataExportProjectSchema>;

export type DataExportNewProjectDefaultSettings = z.infer<
  typeof DataExportNewProjectDefaultSettingsSchema
>;
