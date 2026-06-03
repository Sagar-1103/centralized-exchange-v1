import { z } from "zod";

export const onRampSchema = z.object({
    amount: z.number().positive("Requested amount must be positive"),
})