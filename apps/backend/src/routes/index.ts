import { Router } from "express";
import { authRouter } from "./auth.route";
import { perpRouter } from "./perp.route";
import { spotRouter } from "./spot.route";
import { adminRouter } from "./admin.route";

const appRouter = Router();

appRouter.use("/auth",authRouter);
appRouter.use("/spot",spotRouter);
appRouter.use("/perps",perpRouter);
appRouter.use("/admin",adminRouter);

export default appRouter;