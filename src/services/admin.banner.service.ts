import { AppError } from "../errors/AppError";
import { uploadBannerImageToCloudinary } from "../lib/cloudinary";
import { createAdminBanner, findAllBannersFromDB } from "../repositories/admin.banner.repository";
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

  return banner;
}

export async function fetchAdminBanners(): Promise<Banner[]> {
  const banners = await findAllBannersFromDB();
  return banners;
}
