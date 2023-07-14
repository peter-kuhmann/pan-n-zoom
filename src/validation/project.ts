import { z } from "zod";

export const ProjectSchema = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty(),
  image: z.object({
    storageId: z.string().nonempty(),
  }),
});
