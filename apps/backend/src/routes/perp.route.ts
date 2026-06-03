import { Router } from "express"
import { requireAuth } from "../middlewares/auth.middleware";
import { cancelOrder, createOrder, getAvailableEquity, getClosedPositionByMarketId, getDepth, getFills, getOpenOrdersByMarketId, getOpenPositionByMarketId, getOrdersByMarketId, onRamp } from "../controllers/perp.controller";

export const perpRouter = Router();

perpRouter.use(requireAuth);

perpRouter.post("/onramp",onRamp);
perpRouter.post("/order",createOrder);
perpRouter.delete("/order",cancelOrder);
perpRouter.get("/equity/available",getAvailableEquity);
perpRouter.get("/positions/open/:marketId",getOpenPositionByMarketId);
perpRouter.get("/positions/closed/:marketId",getClosedPositionByMarketId);
perpRouter.get("/orders/open/:marketId",getOpenOrdersByMarketId);
perpRouter.get("/orders/:marketId",getOrdersByMarketId);
perpRouter.get("/fills",getFills);
perpRouter.get("/depth/:symbol",getDepth);