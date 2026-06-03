import { createClient } from "redis";
import { env } from "./constants/env";
import { requestHandlers, type EngineRequest, type EngineRequestType, type EngineResponse } from "./store/perps-store";
import { S3Client } from "bun";
import handleOnboard from "./handlers/onboard";
import handleOnramp from "./handlers/onramp";
import handleGetDepth from "./handlers/get-depth";
import handleCreateMarket from "./handlers/create-market";
import handleCreateOrder from "./handlers/create-order";

const brokerClient = createClient({ url: env.redisUrl }).on(
  "error",
  (error) => {
    console.error("Redis broker client error: ", error);
  },
);

const responseClient = createClient({ url: env.redisUrl }).on(
  "error",
  (error) => {
    console.error("Redis response client error: ", error);
  },
);



const handlePerpsEngineRequest = (message: EngineRequest): unknown => {
  const handler = requestHandlers[message.type];
  return handler(message);
};

const sendResponse = async (
  responseQueue: string,
  response: EngineResponse,
) => {
  await responseClient.xAdd(responseQueue, "*", {
    data: JSON.stringify(response),
  });
};

const startPerpsEngine = async () => {
  await Promise.all([brokerClient.connect(), responseClient.connect()]);

  console.log(`Engine listening on Redis queue: ${env.perpsIncomingQueue}`);

  for (; ;) {
    let message: EngineRequest;
    try {
      const item = await brokerClient.xRead({
        key: env.perpsIncomingQueue,
        id: "$",
      }, {
        BLOCK: 0,
        COUNT: 1
      })
      if (!item) {
        continue;
      }
      //@ts-ignore
      message = JSON.parse(item?.[0]?.messages?.[0]?.message.data) as EngineRequest;
    } catch (error) {
      console.error("Skipping invalid broker message");
      continue;
    }

    try {
      const data = handlePerpsEngineRequest(message);
      await sendResponse(message.responseQueue, {
        data,
        ok: true,
        correlationId: message.correlationId,
      });
    } catch (error) {
      await sendResponse(message.responseQueue, {
        ok: false,
        correlationId: message.correlationId,
        error: error instanceof Error ? error.message : "perps_engine_error",
      });
    }
  }

};

const client = new S3Client({
  accessKeyId: env.awsAccessKeyId,
  secretAccessKey: env.awsSecretAccessKey,
  bucket: env.awsBucketName,
  region: env.awsRegion,
});

const restoreFromLatestSnapshot = async () => {
  const response = await client.list({
    prefix: "perps-engine-snapshots/",
  });

  const snapshots = response.contents?.filter(snapshot => snapshot.size !== 0);

  if (!snapshots?.length) {
    console.log("No snapshots");
    return;
  }
  const latestSnapshot = snapshots[snapshots.length - 1];
  if (!latestSnapshot) return;

  const file = client.file(latestSnapshot.key);
  const data = await file.json();
  console.log(data);
  //TODO: Reinitialize all the inmemory data
}

const captureSnapshot = async () => {
  try {
    setInterval(async () => {
      const response = await client.list({
        prefix: "perps-engine-snapshots/",
      });

      const prevSnapshots = response.contents?.filter(snapshot => snapshot.size !== 0);

      const key = prevSnapshots?.[0]?.key;
      if (prevSnapshots?.length && prevSnapshots.length >= env.totalSnapshots && key) {
        await client.delete(key);
        console.log(`Deleted snapshot ${key} at ${Date.now()}`);
      }

      const stamp = Date.now();
      const data = { name: `Sagar-${stamp}` };

      await client.write(`${response.prefix}inmemory-data-${stamp}.json`, JSON.stringify(data), {
        type: "application/json"
      });

      console.log(`Captured snapshot at ${stamp}`);
    }, env.backupIntervalMs);

  } catch (error) {
    console.log("Error capturing snapshot");
  }
}

const restoreFromStream = async () => {
  //TODO: retreive remaining state from redis streams by replaying the events
}

const main = async () => {
  await restoreFromLatestSnapshot();
  await restoreFromStream();
  await startPerpsEngine();
  await captureSnapshot();
}

main();