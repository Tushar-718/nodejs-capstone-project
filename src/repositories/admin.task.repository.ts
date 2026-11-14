import { pool } from "../lib/db";
import { Task } from "../types/task";

export type AdminTaskListFilters = {
  search?: string | undefined;
  status?: string | undefined;
};
export async function findAllTasks(filters: AdminTaskListFilters): Promise<Task[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];

  let paramIndex = 1;
  if (filters.search) {
    conditions.push(`title ILIKE $${paramIndex}`);
    values.push(`%${filters.search}%`);
    paramIndex++;
  }

  if (filters.status) {
    conditions.push(`status= $${paramIndex}`);
    values.push(filters.status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await pool.query<Task>(
    `
          SELECT id, title, status, user_id, created_at, updated_at
          FROM support_tasks
          ${whereClause}
          ORDER BY created_at DESC
      `,
    values,
  );

  return result.rows;
}

export async function updateAdminTaskByTaskId(taskId: string, status: string): Promise<Task> {
  const result = await pool.query<Task>(
    `
        UPDATE support_tasks
        SET status =$2, updated_at = NOW()
        WHERE id = $1
        RETURNING id, user_id, title, status, created_at, updated_at
    `,
    [taskId, status],
  );
  return result.rows[0]!;
}
