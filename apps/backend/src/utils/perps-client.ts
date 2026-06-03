import { env } from "../constants/env";
import { resolveEngineResponse, waitForEngineResponse } from "../store/pending-response";
import { publisher, subscriber } from "./redis-client";

export type EngineType = "create_order" | "onramp" | "onboard" | "create_market" | "get_depth";

export type OrderSide = "BUY" | "SELL";
export type PositionSide = "LONG" | "SHORT";

export type Payload = Record<string,unknown>;

export interface EngineRequest {
    correlationId:string;
    payload:Payload;
    responseQueue:string;
    type:EngineType;
}

export interface EngineResponse {
    correlationId:string;
    data?:unknown;
    ok:boolean;
    error?:string;
}

export const sendToEngine = async(type:EngineType,payload:Payload) => {
    const correlationId = crypto.randomUUID();

    const pendingResponse = waitForEngineResponse(correlationId,env.engineTimeoutMs);

    const message: EngineRequest = {
        payload,
        correlationId,
        type,
        responseQueue:env.responseQueue,
    }

    await publisher.xAdd(env.perpsIncomingQueue,"*",{
        data:JSON.stringify(message),
    })

    return pendingResponse;
}

export const listenForEngineResponses = async() =>{
  for (;;) {
    try {
      const item = await subscriber.xRead({
        key: env.responseQueue,
        id:"$"
      },{
        BLOCK:0,
        COUNT:1,
      });

      //@ts-ignore
      const response = JSON.parse(item?.[0]?.messages?.[0]?.message.data) as EngineResponse;
      
      if (!response) continue;

      resolveEngineResponse(response);
    } catch (error) {
      console.error("Invalid Response: ",error);
    }
  }
}