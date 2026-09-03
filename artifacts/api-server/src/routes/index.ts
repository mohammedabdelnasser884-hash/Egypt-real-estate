import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import profileRouter from "./profile";
import listingsRouter from "./listings";
import officesRouter from "./offices";
import requestsRouter from "./requests";
import savedSearchesRouter from "./savedSearches";
import favoritesRouter from "./favorites";
import comparisonsRouter from "./comparisons";
import notificationsRouter from "./notifications";
import reportsRouter from "./reports";
import metaRouter from "./meta";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(profileRouter);
router.use(listingsRouter);
router.use(officesRouter);
router.use(requestsRouter);
router.use(savedSearchesRouter);
router.use(favoritesRouter);
router.use(comparisonsRouter);
router.use(notificationsRouter);
router.use(reportsRouter);
router.use(metaRouter);

export default router;
