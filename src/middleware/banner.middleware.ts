import multer from "multer";
import { MAX_FILE_SIZE } from "../constants/validation";
import { AppError } from "../errors/AppError";

export const uploadBannerImg = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new AppError(400, "Only image format upload is allowed"));
      return;
    }

    callback(null, true);
  },
});

export const uploadSingleBannerImage = uploadBannerImg.single("image");
