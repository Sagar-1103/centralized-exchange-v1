import dotenv from "dotenv";
import { createClient } from "redis";
import { env } from "./constants/env";
import type { WebSocketResponse } from "./types";
dotenv.config();

export const redisClient = createClient({url:process.env.REDIS_URL!}).on("error",(error)=>{
    console.error("Redis subcriber error: ",error);
})

const main = async() => {
    await Promise.all([redisClient.connect()]);
    await listenToBinance();
}

const sendToStream = async(streamPayload: WebSocketResponse) => {
    await redisClient.xAdd("orders","*",{data: JSON.stringify(streamPayload)});
}

const listenToBinance = async() => {
    const ws = new WebSocket(env.binanceWebsocketUrl);
    let timer: NodeJS.Timeout;
    if (!ws) return;

    // ws.onopen = () => {
    //     timer = setInterval(() => {
    //         const payload = {
    //             id: crypto.randomUUID(),
    //             method: "ticker.price",
    //             params: { symbol: "BTCUSDT" }
    //         }
    //         ws.send(JSON.stringify(payload));
    //     }, 10000);
    // }

    ws.onmessage = async(msg) => {
        let response = JSON.parse(msg.data);
        response.createdAt = Date.now();
        // await sendToStream(response);
        console.log(response);
        
    }

    ws.onerror = (error) => {
        // clearInterval(timer);
        console.log("Error: ",error.message);
    }

    ws.onclose = (error) => {
        // clearInterval(timer);
        console.log("Closed: ",error);
    }
}

// main();