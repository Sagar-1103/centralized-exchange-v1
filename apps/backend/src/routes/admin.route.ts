import { Router } from "express";
import { isAdmin } from "../middlewares/admin.middleware";
import { createMarket } from "../controllers/admin.controller";

export const adminRouter = Router();

adminRouter.use(isAdmin);
adminRouter.post("/market",createMarket);