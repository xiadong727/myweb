import { Redis } from "@upstash/redis";

// 同时兼容 Upstash 原生变量名与 Vercel KV 集成注入的变量名
const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

/** 是否已配置数据库；未配置时所有操作安全降级为 0，不报错 */
export const metricsEnabled = Boolean(url && token);

const redis = metricsEnabled ? new Redis({ url: url as string, token: token as string }) : null;

export const METRIC_TYPES = ["articles", "images", "videos", "audios"] as const;
export type MetricType = (typeof METRIC_TYPES)[number];

/** 校验并组装 id = `${type}:${slug}`，防止写入任意 Redis 键 */
export function parseId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const idx = raw.indexOf(":");
  if (idx < 0) return null;
  const type = raw.slice(0, idx);
  const slug = raw.slice(idx + 1);
  if (!METRIC_TYPES.includes(type as MetricType)) return null;
  if (!slug || slug.length > 256 || !/^[\w\-/.]+$/.test(slug)) return null;
  return `${type}:${slug}`;
}

function keys(id: string) {
  return { views: `views:${id}`, likes: `likes:${id}` };
}

export type Metrics = { views: number; likes: number };

export async function readMetrics(id: string): Promise<Metrics> {
  if (!redis) return { views: 0, likes: 0 };
  const k = keys(id);
  const [views, likes] = await redis.mget<[number | null, number | null]>(k.views, k.likes);
  return { views: views ?? 0, likes: likes ?? 0 };
}

/** 浏览量 +1，返回最新浏览量 */
export async function incrView(id: string): Promise<number> {
  if (!redis) return 0;
  return await redis.incr(keys(id).views);
}

/** 点赞数 +1 / -1，返回最新点赞数（不会低于 0） */
export async function changeLike(id: string, delta: 1 | -1): Promise<number> {
  if (!redis) return 0;
  const likes = await redis.incrby(keys(id).likes, delta);
  if (likes < 0) {
    await redis.set(keys(id).likes, 0);
    return 0;
  }
  return likes;
}
