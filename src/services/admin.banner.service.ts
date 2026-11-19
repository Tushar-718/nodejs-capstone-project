import { AppError } from "../errors/AppError";
import { clearBannerCache, getBannersFromCache, setBannerCache } from "../lib/bannerCache";
import { uploadBannerImageToCloudinary } from "../lib/cloudinary";
import { logger } from "../lib/logger";
import { addDeleteCloudinaryJob } from "../queues/deleteCloudinaryImage.queue";
import {
  createAdminBanner,
  deleteAdminBannerById,
  findAllBannersFromDB,
} from "../repositories/admin.banner.repository";
import { Banner } from "../types/banner";

export async function createAdminBannerService(file: Express.Multer.File | undefined): Promise<Banner> {
  if (!file) {
    throw new AppError(400, "Image is required");
  }

  if (!file.buffer) {
    throw new AppError(400, "Image type is invalid");
  }
  const { secureUrl, publicId } = await uploadBannerImageToCloudinary(file.buffer, {
    folder: "nodejs-capstone-project",
  });

  if (!secureUrl || !publicId) {
    throw new AppError(400, "Cloudinary error");
  }

  const banner = await createAdminBanner(secureUrl, publicId);

  // invalidate cache
  logger.info("Banner Cache cleared !!!");
  await clearBannerCache();

  return banner;
}

export async function fetchAdminBanners(): Promise<Banner[]> {
  const getCachedBanner = await getBannersFromCache();
  if (getCachedBanner) {
    logger.info("Banner Cache HIT!!! : Serving data from redis");
    return getCachedBanner;
  }
  const banners = await findAllBannersFromDB();

  // set data to cache
  logger.info("Banner Cache MISS!!! : Setting data to redis");
  await setBannerCache(banners);
  return banners;
}

export async function deleteAdminBanner(bannerId: string): Promise<void> {
  // delete from our DB and get public id
  const publicId = await deleteAdminBannerById(bannerId);
  if (!publicId) {
    throw new AppError(404, "Banner not found");
  }
  // also remove from cache
  await clearBannerCache();

  // add bullmq job
  await addDeleteCloudinaryJob(publicId);
}
