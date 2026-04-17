import { Router, type IRouter } from "express";
import healthRouter from "./health";
import defectsRouter from "./defects";
import photosRouter from "./photos";

const router: IRouter = Router();

router.use(healthRouter);
router.use(defectsRouter);
router.use(photosRouter);

export default router;
