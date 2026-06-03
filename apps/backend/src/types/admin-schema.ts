import { z } from "zod";

export const createMarketSchema = z.object({
    symbol: z.string().trim().min(1,"Symbol is required"),
});