import { createClient } from "redis";
import { env } from "./constants/env";

const redisClient = createClient({url:env.redisUrl}).on("error",(error)=>{
    console.error("Redis Client Error: ",error);
});

const main = async() => {
    for(;;) {
        let message;
        try {
            const item = await redisClient.xRead({
                key: "db-poll",
                id:"$",
            },{
                BLOCK: 0,
                COUNT: 1,
            });

            if (!item) {
                continue;
            }

            //@ts-ignore
            message = JSON.parse(item?.[0]?.messages?.[0]?.message.data);
            console.log(message);
            

        } catch (error) {
            console.error("Skipping invalid message");
            continue;
        }

        //TODO: add the db polling logic
    }
}

// main();