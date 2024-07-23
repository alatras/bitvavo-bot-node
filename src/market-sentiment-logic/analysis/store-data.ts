import { VisibleVolumeCalculationResult } from './analyze-trading';
import redis from '../../utils/redis-client';
import { Trading } from './calculate-order-book-imbalance';

export async function storeData(trading: Trading): Promise<void> {
  const timestamp = Date.now();
  const key = `trading:${timestamp}`;
  await redis.hmset(key, trading);
  await redis.expire(key, (Number(process.env.HOURS_TO_KEEP_REDIS_DATA)) * 3600);
}