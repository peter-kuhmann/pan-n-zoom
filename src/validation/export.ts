import { z } from "zod";
import { SuiteSchema } from "@/validation/suite.ts";

export const DataExportSchema = z.object({
  type: z.literal("suite-export"),
  suite: SuiteSchema,
  imageStorage: z.object({
    images: z.array(
      z.object({ id: z.string().nonempty(), dataUrl: z.string().nonempty() }),
    ),
  }),
});
