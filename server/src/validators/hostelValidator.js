import { z } from "zod";

export const hostelQuerySchema = z.object({
    type: z.enum(["single", "triple"]).optional(),
}).strict();