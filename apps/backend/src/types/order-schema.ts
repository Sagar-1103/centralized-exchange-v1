import { z } from "zod";

export const createOrderSchema = z.discriminatedUnion("type",[
    z.object({
        type: z.literal("LIMIT"),
        side: z.enum(["BUY","SELL"]),
        symbol: z.string().trim().min(1,"Symbol is required"),
        qty: z.number().positive("Quantity must be greater than zero"),
        equity: z.number().positive("Equity must be a positive number"),
        price: z.number().positive("Price must be greater than zero"),
    }),
    z.object({
        type: z.literal("MARKET"),
        side: z.enum(["BUY","SELL"]),
        symbol: z.string().trim().min(1,"Symbol is required"),
        equity: z.number().positive("Equity must be a positive number"),
        qty: z.number().positive("Quantity must be greater than zero"),
        price: z.null().optional(),
    })
])