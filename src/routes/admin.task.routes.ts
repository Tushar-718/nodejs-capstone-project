import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/admin.middleware";
import { getAdminTasks, updateAdminTasks } from "../services/admin.task.service";
import { TASK_STRINGS } from "../constants/string";

export const adminTaskRouter = Router();

adminTaskRouter.use(authenticate, requireAdmin);

adminTaskRouter.get("/", async (req, res, next) => {
  try {
    const data = await getAdminTasks(req.query);
    res.status(200).json({
      success: true,
      data,
      message: TASK_STRINGS.TASKS_FETCH_SUCCESSFULLY,
    });
  } catch (error) {
    next(error);
  }
});

adminTaskRouter.patch("/:taskId/status", async (req, res, next) => {
  try {
    const data = await updateAdminTasks(req.params?.taskId, req.body?.status);
    res.status(200).json({
      success: true,
      data,
      message: TASK_STRINGS.TASK_UPDATED,
    });
  } catch (error) {
    next(error);
  }
});
