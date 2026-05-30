import { Redis } from "@upstash/redis";

/**
 * 自动识别 Vercel/Upstash 注入的 REST 凭证。
 * 不同时期、不同集成会用不同前缀（UPSTASH_REDIS_、KV_、STORAGE_、自定义前缀…），
 * 这里既优先匹配已知命名，也兜底扫描任意 `*REST_API_URL` + 同前缀 `*REST_API_TOKEN`。
 */
function resolveRedisCreds(): { url: string; token: string; source: string } | null {
  const env = process.env;

  const known: [string, string][] = [
    ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"],
    ["KV_REST_API_URL", "KV_REST_API_TOKEN"],
  ];
  for (const [u, t] of known) {
    if (env[u] && env[t]) return { url: env[u] as string, token: env[t] as string, source: u };
  }

  // 兜底：任意以 REST_API_URL 结尾的变量 + 同前缀的 REST_API_TOKEN
  for (const key of Object.keys(env)) {
    if (key.endsWith("REST_API_URL")) {
      const prefix = key.slice(0, -"REST_API_URL".length);
      const tokenKey = `${prefix}REST_API_TOKEN`;
      if (env[key] && env[tokenKey]) {
        return { url: env[key] as string, token: env[tokenKey] as string, source: key };
      }
    }
  }
  return null;
}

const creds = resolveRedisCreds();

/** 是否已配置数据库；未配置时所有操作安全降级为 0，不报错 */
export const metricsEnabled = Boolean(creds);

/** 命中的环境变量名（仅变量名、非密钥），供诊断用 */
export const metricsSource = creds?.source ?? null;

const redis = creds ? new Redis({ url: creds.url, token: creds.token }) : null;

export const METRIC_TYPES = ["articles", "images", "videos", "audios"] as const;

/** 全站作品总浏览量累加键（每次作品浏览 +1） */
const TOTAL_VIEWS_KEY = "views:__total__";
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

/** 批量读取多个作品的计数（一次 mget），用于列表页 */
export async function readManyMetrics(ids: string[]): Promise<Record<string, Metrics>> {
  const out: Record<string, Metrics> = {};
  if (ids.length === 0) return out;
  if (!redis) {
    for (const id of ids) out[id] = { views: 0, likes: 0 };
    return out;
  }
  const flat: string[] = [];
  for (const id of ids) {
    const k = keys(id);
    flat.push(k.views, k.likes);
  }
  const vals = await redis.mget<(number | null)[]>(...flat);
  ids.forEach((id, i) => {
    out[id] = { views: vals[i * 2] ?? 0, likes: vals[i * 2 + 1] ?? 0 };
  });
  return out;
}

/** 浏览量 +1，同时累加全站总浏览量，返回该作品最新浏览量 */
export async function incrView(id: string): Promise<number> {
  if (!redis) return 0;
  const [n] = await Promise.all([redis.incr(keys(id).views), redis.incr(TOTAL_VIEWS_KEY)]);
  return n;
}

/** 全站作品总浏览量 */
export async function readTotalViews(): Promise<number> {
  if (!redis) return 0;
  return (await redis.get<number>(TOTAL_VIEWS_KEY)) ?? 0;
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
