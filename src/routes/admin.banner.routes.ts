import { NextFunction, Request, Response, Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/admin.middleware";
import { uploadSingleBannerImage } from "../middleware/banner.middleware";
import { createAdminBannerService, deleteAdminBanner, fetchAdminBanners } from "../services/admin.banner.service";

export const adminBannerRouter = Router();

adminBannerRouter.use(authenticate, requireAdmin);

adminBannerRouter.post("/", uploadSingleBannerImage, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const banner = await createAdminBannerService(req.file);
    res.status(201).json({
      success: true,
      data: { banner },
    });
  } catch (error) {
    next(error);
  }
});

adminBannerRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const banners = await fetchAdminBanners();
    res.status(200).json({
      success: true,
      data: { banners },
    });
  } catch (error) {
    next(error);
  }
});

adminBannerRouter.delete("/:bannerId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteAdminBanner(req.params?.bannerId);
    res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});
