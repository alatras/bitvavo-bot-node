import redis from "../../utils/redis-client";

/**
 * Calculate the moving average of the mid price of the trading data
 * @returns The moving average of the mid price
*/
export async function calculateMovingAverage(instanceId: string): Promise<number> {
  const keys = await redis.keys(`trading:${instanceId}*`);
  const data = await Promise.all(keys.map(key => redis.hgetall(key)));
  const midPrices = data.map(item => parseFloat(item.midPrice));
  return midPrices.reduce((sum, price) => sum + price, 0) / midPrices.length;
}