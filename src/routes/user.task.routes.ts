import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  createUserTask,
  getUserTasks,
  getUserTaskById,
  updateUserTaskById,
  deleteUserTaskById,
} from "../services/user.task.service";
import { TASK_STRINGS } from "../constants/string";

export const userTaskRouter = Router();
// this ensures all router is protected by authenticate middleware
userTaskRouter.use(authenticate);

userTaskRouter.post("/", async (req, res, next) => {
  try {
    const task = await createUserTask(req.user!.userId, req.body?.title);
    res.status(201).json({
      success: true,
      data: {
        task,
      },
      message: TASK_STRINGS.TASK_CREATED,
    });
  } catch (error) {
    next(error);
  }
});

userTaskRouter.get("/", async (req, res, next) => {
  try {
    const tasks = await getUserTasks(req.user!.userId);
    res.status(200).json({
      success: true,
      data: {
        tasks,
      },
      message: TASK_STRINGS.TASKS_FETCH_SUCCESSFULLY,
    });
  } catch (error) {
    next(error);
  }
});

userTaskRouter.get("/:taskId", async (req, res, next) => {
  try {
    const task = await getUserTaskById(req.user!.userId, req.params.taskId);
    res.status(200).json({
      success: true,
      data: {
        task,
      },
      message: TASK_STRINGS.TASKS_FETCH_SUCCESSFULLY,
    });
  } catch (error) {
    next(error);
  }
});

userTaskRouter.patch("/:taskId", async (req, res, next) => {
  try {
    const task = await updateUserTaskById(req.user!.userId, req.params.taskId, req.body?.title);
    res.status(200).json({
      success: true,
      data: {
        task,
      },
      message: TASK_STRINGS.TASK_UPDATED,
    });
  } catch (error) {
    next(error);
  }
});

userTaskRouter.delete("/:taskId", async (req, res, next) => {
  try {
    await deleteUserTaskById(req.user!.userId, req.params.taskId);
    res.status(200).json({
      success: true,
      message: TASK_STRINGS.TASK_DELETED,
    });
  } catch (error) {
    next(error);
  }
});
