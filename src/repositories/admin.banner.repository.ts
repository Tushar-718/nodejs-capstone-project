import { pool } from "../lib/db";
import { Banner } from "../types/banner";

export async function createAdminBanner(imageUrl: string, cloudinaryPublicId: string): Promise<Banner> {
  const result = await pool.query<Banner>(
    `
        INSERT INTO banners (image_url,cloudinary_public_id)
        VALUES ($1,$2)
        RETURNING id, image_url, cloudinary_public_id, created_at, updated_at
    `,
    [imageUrl, cloudinaryPublicId],
  );

  return result.rows[0]!;
}

export async function findAllBannersFromDB(): Promise<Banner[]> {
  const result = await pool.query<Banner>(
    `
        SELECT id, image_url, cloudinary_public_id, created_at, updated_at
        FROM banners
        ORDER BY created_at DESC
    `,
  );

  return result.rows;
}
