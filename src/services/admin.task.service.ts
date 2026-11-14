import { TASK_STRINGS } from "../constants/string";
import { UUID_REGEX } from "../constants/validation";
import { AppError } from "../errors/AppError";
import { findAllTasks, updateAdminTaskByTaskId } from "../repositories/admin.task.repository";
import { Task, TASK_STATUS, TaskStatus } from "../types/task";

type AdminTaskListQuery = {
  search?: string | undefined;
  status?: string | undefined;
};

type AdminTaskListResponse = {
  tasks: Task[];
};
export async function getAdminTasks(query: AdminTaskListQuery): Promise<AdminTaskListResponse> {
  const search = query?.search?.trim() || undefined;
  const status = query?.status?.trim() || undefined;

  if (status && !TASK_STATUS.includes(status as TaskStatus)) {
    throw new AppError(400, TASK_STRINGS.INVALID_STATUS);
  }

  const tasks = await findAllTasks({ search, status });
  return { tasks };
}

export async function updateAdminTasks(taskId: string, status: string): Promise<Task> {
  if (!UUID_REGEX.test(taskId)) {
    throw new AppError(404, TASK_STRINGS.TASK_NOT_FOUND);
  }

  if (status && !TASK_STATUS.includes(status as TaskStatus)) {
    throw new AppError(400, TASK_STRINGS.INVALID_STATUS);
  }

  const task = await updateAdminTaskByTaskId(taskId, status);
  if (!task) {
    throw new AppError(404, TASK_STRINGS.TASK_NOT_FOUND);
  }
  return task;
}
