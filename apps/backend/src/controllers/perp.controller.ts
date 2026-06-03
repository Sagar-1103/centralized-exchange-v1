import type { Request, Response } from "express"
import { AsyncHandler, getUserId } from "../utils/helper-functions"
import { sendToEngine } from "../utils/perps-client";
import { createOrderSchema } from "../types/order-schema";
import { sendValidationError } from "../utils/validation";
import { onRampSchema } from "../types/onramp-schema";

export const onRamp = AsyncHandler(async(req:Request,res:Response) => {
    const userId = getUserId(req,res);
    const parsedBody = onRampSchema.safeParse(req.body);
    if (!parsedBody.success) {
        sendValidationError(res,parsedBody.error);
        return;
    }

    const { amount } = parsedBody.data;

    const engineResponse = await sendToEngine("onramp",{
        userId,
        amount
    });

    return res.status(engineResponse.ok?200:400).json({success:engineResponse.ok,data:engineResponse.data,error:engineResponse.error});
})

export const createOrder = AsyncHandler(async(req:Request,res:Response) => {
    const userId = getUserId(req,res);

    const parsedBody = createOrderSchema.safeParse(req.body);

    if (!parsedBody.success) {
        sendValidationError(res,parsedBody.error);
        return;
    }

    const { symbol, qty, side, type, equity } = parsedBody.data;
    const price = parsedBody.data.type==="MARKET" ? null : parsedBody.data.price;

    const engineResponse = await sendToEngine("create_order",{
        userId,
        price,
        symbol,
        qty,
        equity,
        type,
        side,
    });
    
    return res.status(engineResponse.ok?201:400).json({success:engineResponse.ok,data:engineResponse.data,error:engineResponse.error});
})

export const cancelOrder = AsyncHandler(async(req:Request,res:Response) => {
    return res.status(200).json({success:true});
})

export const getFills = AsyncHandler(async(req:Request,res:Response) => {
    return res.status(200).json({success:true});
})

export const getOrdersByMarketId = AsyncHandler(async(req:Request,res:Response) => {
    return res.status(200).json({success:true});
})

export const getOpenOrdersByMarketId = AsyncHandler(async(req:Request,res:Response) => {
    return res.status(200).json({success:true});
})

export const getAvailableEquity = AsyncHandler(async(req:Request,res:Response) => {
    return res.status(200).json({success:true});
})

export const getOpenPositionByMarketId = AsyncHandler(async(req:Request,res:Response) => {
    return res.status(200).json({success:true});
})

export const getClosedPositionByMarketId = AsyncHandler(async(req:Request,res:Response) => {
    return res.status(200).json({success:true});
})

export const getDepth = AsyncHandler(async(req:Request,res:Response) => {
    const userId = getUserId(req,res);

    const { symbol } = req.params;

    if (!symbol) {
        return res.status(401).json({success:false,message:"Symbol not provided"});
    }

    const engineResponse = await sendToEngine("get_depth",{
        userId,
        symbol,
    });
    
    return res.status(engineResponse.ok?201:400).json({success:engineResponse.ok,data:engineResponse.data,error:engineResponse.error});
})