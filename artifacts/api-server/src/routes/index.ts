import { Router, type IRouter } from "express";
import healthRouter from "./health";
import playersRouter from "./players";
import imagesRouter from "./images";
import brawlProxyRouter from "./brawlProxy";

const router: IRouter = Router();

router.use(healthRouter);
router.use(brawlProxyRouter);
router.use(playersRouter);
router.use(imagesRouter);

export default router;
