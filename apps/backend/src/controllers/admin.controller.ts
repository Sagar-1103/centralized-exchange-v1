import type { Request, Response } from "express";
import { AsyncHandler } from "../utils/helper-functions";
import { createMarketSchema } from "../types/admin-schema";
import { sendValidationError } from "../utils/validation";
import { prisma } from "@repo/db/client";
import { sendToEngine } from "../utils/perps-client";

export const createMarket = AsyncHandler(async(req:Request,res:Response)=>{
    const parsedBody = createMarketSchema.safeParse(req.body);
    if (!parsedBody.success) {
        sendValidationError(res,parsedBody.error);
        return;
    }

    const { symbol } = parsedBody.data;

    // let market = await prisma.market.findFirst({
    //     where:{
    //         symbol,
    //     },
    // });

    // if (market) {
    //     return res.status(401).json({success:false,message:"Market already exists"});
    // }

    // market = await prisma.market.create({
    //     data:{
    //         symbol,
    //     },
    // });

    const engineResponse = await sendToEngine("create_market",{
        symbol,
    });

    return res.status(engineResponse.ok?201:400).json({success:engineResponse.ok,data:engineResponse.data,error:engineResponse.error});
});