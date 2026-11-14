// import all routes here

import { Router } from "express";
import { healthRouter } from "./health.routes";
import { authRouter } from "./auth.routes";
import { userTaskRouter } from "./user.task.routes";
import { adminTaskRouter } from "./admin.task.routes";

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/task", userTaskRouter);
apiRouter.use("/admin/task", adminTaskRouter);
