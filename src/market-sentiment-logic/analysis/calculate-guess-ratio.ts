import logger from "../../utils/logger";
import redis from "../../utils/redis-client";
import { TradeSignal } from "../types";

/**
 * Calculate the ratio of correct guesses based on the previous and current price change
 * @returns The ratio of correct guesses
 * @examples
 * If the signal is BUY and the price change is positive, it is a correct guess.
 * If the signal is SELL and the price change is negative, it is also a correct guess.
 * If the signal is BUY and the price change is negative, it is an incorrect guess.
 * If the signal is SELL and the price change is positive, it is also an incorrect guess.
 */
export async function calculateGuessRatio(instanceId: string): Promise<number> {
  const keys = await redis.keys(`trading:${instanceId}:*`);
  const data = await Promise.all(keys.map((key) => redis.hgetall(key)));

  let correctGuesses = 0;
  let totalGuesses = 0;

  for (let i = 1; i < data.length; i++) {
    const prevData = data[i - 1];
    const currData = data[i];

    const prevPrice = parseFloat(prevData.midPrice);
    const currPrice = parseFloat(currData.midPrice);
    const priceChange = (currPrice - prevPrice) / prevPrice;
    const difference = Math.abs(priceChange);

    const maxDifferenceForHold = Number(process.env.MAX_DIFFERENCE_FOR_HOLD);

    const minDifferenceForAnalysis = Number(
      process.env.MINIMUM_DIFFERENCE_FOR_ANALYSIS
    );

    if (difference >= minDifferenceForAnalysis) {
      totalGuesses++;
      if (
        (prevData.tradeSignal === TradeSignal.BUY && priceChange > 0) ||
        (prevData.tradeSignal === TradeSignal.SELL && priceChange < 0) ||
        (prevData.tradeSignal === TradeSignal.HOLD &&
          difference <= maxDifferenceForHold)
      ) {
        correctGuesses++;
      }
    } else {
      logger.warning(
        "Price change is below MINIMUM_DIFFERENCE_FOR_ANALYSIS. Skipping the analysis."
      );
    }
  }

  return totalGuesses > 0 ? correctGuesses / totalGuesses : 0;
}
