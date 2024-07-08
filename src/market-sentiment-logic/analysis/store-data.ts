import { CalculationResult } from './analyze-trading';
import redis from '../../utils/redis-client';
import { State } from '..';

export async function storeData(visibleVolume: CalculationResult, state: State): Promise<void> {
  const timestamp = Date.now();
  const key = `trading:${timestamp}`;
  await redis.hmset(key, {
    ...visibleVolume,
    ...state,
    timestamp,
  });
  await redis.expire(key, (Number(process.env.HOURS_TO_KEEP_REDIS_DATA)) * 3600);
}