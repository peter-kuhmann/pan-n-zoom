import { type z } from "zod";
import { type DataExportSchema } from "@/validation/export.ts";

export type DataExport = z.infer<typeof DataExportSchema>;
