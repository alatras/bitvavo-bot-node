import redis from "../../utils/redis-client";
import { Trading } from "../types";

export async function storeData(trading: Trading): Promise<void> {
  const timestamp = Date.now();
  const key = `trading:${trading.instanceId}:${timestamp}`;
  await redis.hmset(key, trading);
  await redis.expire(key, Number(process.env.HOURS_TO_KEEP_REDIS_DATA) * 3600);
}
