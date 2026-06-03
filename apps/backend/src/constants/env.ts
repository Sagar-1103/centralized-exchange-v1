import { getRequiredEnv } from "@repo/shared-utils";
import dotenv from "dotenv";
dotenv.config();

export const env = {
    port:process.env.PORT || 3000,
    corsOrigin:getRequiredEnv("CORS_ORIGIN"),
    jwtSecret:getRequiredEnv("JWT_SECRET"),
    redisUrl:getRequiredEnv("REDIS_URL"),
    perpsIncomingQueue:process.env.PERPS_INCOMING_QUEUE || "backend-to-perps-engine",
    spotIncomingQueue:process.env.SPOT_INCOMING_QUEUE || "backend-to-spot-engine",
    responseQueue: `response-queue-${process.env.BACKEND_QUEUE_ID ?? crypto.randomUUID()}`,
    engineTimeoutMs: Number(process.env.ENGINE_TIMEOUT_MS ?? "30000"),
    adminToken:getRequiredEnv("ADMIN_TOKEN"),
}