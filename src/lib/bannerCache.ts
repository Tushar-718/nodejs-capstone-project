import { ADMIN_BANNER_CACHE_KEY, ADMIN_BANNER_CACHE_TTL_SECONDS } from "../constants/cacheKeys";
import { Banner } from "../types/banner";
import { redis } from "./redis";

export async function getBannersFromCache(): Promise<Banner[] | null> {
  const cacheData = await redis.get(ADMIN_BANNER_CACHE_KEY);

  if (!cacheData) return null;

  return JSON.parse(cacheData) as Banner[];
}

export async function setBannerCache(banners: Banner[]): Promise<void> {
  await redis.set(ADMIN_BANNER_CACHE_KEY, JSON.stringify(banners), "EX", ADMIN_BANNER_CACHE_TTL_SECONDS);
}

export async function clearBannerCache(): Promise<void> {
  await redis.del(ADMIN_BANNER_CACHE_KEY);
}
