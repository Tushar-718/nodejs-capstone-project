import { pool } from "../lib/db";
import { Task } from "../types/task";

export async function createTask(userId: string, title: string): Promise<Task> {
  const result = await pool.query<Task>(
    `
        INSERT INTO support_tasks (title, user_id)
        VALUES($1,$2)
        RETURNING id, title, status, user_id, created_at, updated_at    
    `,
    [title, userId],
  );

  return result.rows[0]!;
}

export async function fetchTasksByUserId(userId: string): Promise<Task[]> {
  const result = await pool.query<Task>(
    `
        SELECT id, user_id, title, status, created_at, updated_at
        FROM support_tasks
        WHERE user_id=$1
        ORDER BY created_at DESC
    `,
    [userId],
  );

  return result.rows;
}

export async function fetchTaskByTaskId(userId: string, taskId: string): Promise<Task | null> {
  const result = await pool.query<Task>(
    `
        SELECT id, user_id, title, status, created_at, updated_at
        FROM support_tasks
        WHERE user_id=$1 AND id=$2
    `,
    [userId, taskId],
  );

  return result.rows[0] ?? null;
}

export async function updateTaskByTaskId(userId: string, taskId: string, title: string): Promise<Task | null> {
  const result = await pool.query<Task>(
    `
        UPDATE support_tasks
        SET title = $3, updated_at = NOW()
        WHERE user_id=$1 AND id=$2
        RETURNING id, user_id, title, status, created_at, updated_at
    `,
    [userId, taskId, title],
  );

  return result.rows[0] ?? null;
}

export async function deleteTaskById(userId: string, taskId: string): Promise<boolean> {
  const result = await pool.query(
    `
        DELETE FROM support_tasks
        WHERE user_id=$1 AND id=$2
    `,
    [userId, taskId],
  );

  return (result.rowCount ?? 0) > 0;
}
