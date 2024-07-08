import redis from "../../utils/redis-client";

// Additional analysis functions //

/**
 * Calculate the order book imbalance of the trading data
 * @returns The order book imbalance of the trading data
 * @example The order book imbalance is calculated as the difference between the bid volume
 * and the ask volume divided by the sum of the bid and ask volumes
 */
export async function calculateOrderBookImbalance(): Promise<number> {
  const keys = await redis.keys('trading:*');
  const data = await Promise.all(keys.map(key => redis.hgetall(key)));

  const imbalances = data.map(item => {
    const bidVolume = parseFloat(item.bidVolume);
    const askVolume = parseFloat(item.askVolume);
    return (bidVolume - askVolume) / (bidVolume + askVolume);
  });

  return imbalances.reduce((sum, imbalance) => sum + imbalance, 0) / imbalances.length;
}