import { TASK_STRINGS } from "../constants/string";
import { AppError } from "../errors/AppError";
import {
  createTask,
  deleteTaskById,
  fetchTaskByTaskId,
  fetchTasksByUserId,
  updateTaskByTaskId,
} from "../repositories/user.task.repository";
import { Task } from "../types/task";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateTitle(title: unknown): string {
  if (typeof title !== "string" || !title.trim()) {
    throw new AppError(400, TASK_STRINGS.TITLE_REQUIRED);
  }

  const trimmedTitle = title.trim();

  if (trimmedTitle.length > 100) {
    throw new AppError(400, TASK_STRINGS.TITLE_TOO_LONG);
  }
  return trimmedTitle;
}

export async function createUserTask(userId: string, title: unknown): Promise<Task> {
  const validTitle = validateTitle(title);
  return createTask(userId, validTitle);
}

export async function getUserTasks(userId: string): Promise<Task[]> {
  return fetchTasksByUserId(userId);
}

export async function getUserTaskById(userId: string, taskId: string): Promise<Task> {
  if (!UUID_REGEX.test(taskId)) {
    throw new AppError(404, TASK_STRINGS.TASK_NOT_FOUND);
  }
  const task = await fetchTaskByTaskId(userId, taskId);
  if (!task) {
    throw new AppError(404, TASK_STRINGS.TASK_NOT_FOUND);
  }
  return task;
}

export async function updateUserTaskById(userId: string, taskId: string, title: string): Promise<Task> {
  if (typeof title !== "string" || !title.trim()) {
    throw new AppError(400, TASK_STRINGS.TITLE_REQUIRED);
  }
  if (!UUID_REGEX.test(taskId)) {
    throw new AppError(404, TASK_STRINGS.TASK_NOT_FOUND);
  }
  const task = await updateTaskByTaskId(userId, taskId, title);
  if (!task) {
    throw new AppError(404, TASK_STRINGS.TASK_NOT_FOUND);
  }
  return task;
}

export async function deleteUserTaskById(userId: string, taskId: string): Promise<void> {
  if (!UUID_REGEX.test(taskId)) {
    throw new AppError(404, TASK_STRINGS.TASK_NOT_FOUND);
  }
  const task = await deleteTaskById(userId, taskId);
  if (!task) {
    throw new AppError(404, TASK_STRINGS.TASK_NOT_FOUND);
  }
}
