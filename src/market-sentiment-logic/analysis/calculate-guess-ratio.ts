import redis from "../../utils/redis-client";
import { TradeSignal } from "./analyze-trading";

/**
 * Calculate the ratio of correct guesses based on the previous and current price change
 * @returns The ratio of correct guesses
 * @example If the signal is BUY and the price change is positive, it is a correct guess. The opposite is also true.
*/
export async function calculateGuessRatio(): Promise<number> {
  const keys = await redis.keys('trading:*');
  const data = await Promise.all(keys.map(key => redis.hgetall(key)));

  let correctGuesses = 0;
  let totalGuesses = 0;

  for (let i = 1; i < data.length; i++) {
    const prevData = data[i - 1];
    const currData = data[i];

    const prevPrice = parseFloat(prevData.midPrice);
    const currPrice = parseFloat(currData.midPrice);
    const priceChange = (currPrice - prevPrice) / prevPrice;

    if (Math.abs(priceChange) >= Number(process.env.PRICE_CHANGE_THRESHOLD_FOR_ANALYSIS)) {
      totalGuesses++;
      if (
        (prevData.tradeSignal === TradeSignal.BUY && priceChange > 0) ||
        (prevData.tradeSignal === TradeSignal.SELL && priceChange < 0)
      ) {
        correctGuesses++;
      }
    }
  }

  return totalGuesses > 0 ? correctGuesses / totalGuesses : 0;
}