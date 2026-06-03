import type { EngineResponse } from "../utils/perps-client";

interface PenginResponse {
  resolve:(response:EngineResponse) => void;
  reject:(error:Error) => void;
  timeout: ReturnType<typeof setTimeout>;
}

const pendingResponses = new Map<string,PenginResponse>();

export const waitForEngineResponse = (correlationId:string,timeoutMs:number): Promise<EngineResponse> => {
  return new Promise((resolve,reject)=>{
    const timeout = setTimeout(() => {
      pendingResponses.delete(correlationId);
      reject(new Error("Response Timeout"));
    }, timeoutMs);

    pendingResponses.set(correlationId,{
      resolve,
      reject,
      timeout,
    });
  })
}

export const resolveEngineResponse = (response:EngineResponse) => {
  const pending = pendingResponses.get(response.correlationId);
  if (!pending) {
    return;
  }

  clearTimeout(pending.timeout);
  pendingResponses.delete(response.correlationId);
  pending.resolve(response);  
}
