import { Router, type IRouter } from "express";
import healthRouter from "./health";
import playersRouter from "./players";
import imagesRouter from "./images";

const router: IRouter = Router();

router.use(healthRouter);
router.use(playersRouter);
router.use(imagesRouter);

export default router;
