import redis from "../../utils/redis-client";

// Additional analysis functions //

/**
 * Calculate the volatility of the trading data
 * @returns The volatility of the trading data
 * @example The volatility is calculated as the square root of the variance of the mid prices
 * of the trading data
 * @see https://en.wikipedia.org/wiki/Variance
 * @see https://en.wikipedia.org/wiki/Volatility_(finance)
 * @see https://en.wikipedia.org/wiki/Standard_deviation
 * @see https://en.wikipedia.org/wiki/Root_mean_square
 * @see https://en.wikipedia.org/wiki/Root_mean_square_deviation
 * @see https://en.wikipedia.org/wiki/Root_mean_square_error
 */
export async function calculateVolatility(): Promise<number> {
  const keys = await redis.keys('trading:*');
  const data = await Promise.all(keys.map(key => redis.hgetall(key)));
  const midPrices = data.map(item => parseFloat(item.midPrice));

  const mean = midPrices.reduce((sum, price) => sum + price, 0) / midPrices.length;
  const squaredDiffs = midPrices.map(price => Math.pow(price - mean, 2));
  const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / squaredDiffs.length;

  return Math.sqrt(variance);
}