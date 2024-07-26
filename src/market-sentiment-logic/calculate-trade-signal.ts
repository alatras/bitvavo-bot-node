import { TradeSignal } from "./analysis/analyze-trading";
import { SentimentResult } from "./calculate-market-sentiment";

/**
 * Calculates the trade signal based on the market sentiment
 * @param sentiment The sentiment to calculate the trade signal for
 */
export const calculateTradeSignal = (
  sentiment: SentimentResult
): TradeSignal => {
  const sentimentThreshold = Number(process.env.SENTIMENT_THRESHOLD);
  const priceChangeThreshold = Number(process.env.PRICE_CHANGE_THRESHOLD_FOR_ANALYSIS);

  // The difference between the sentiment and the sentiment threshold
  const difference = Math.abs(sentiment.marketSentiment - sentimentThreshold);

  // If the difference is less than the price change threshold, hold
  if (difference <= priceChangeThreshold) {
    return TradeSignal.HOLD;
  }

  // If the sentiment is greater than the sentiment threshold, buy
  if (sentiment.marketSentiment > sentimentThreshold) {
    return TradeSignal.BUY;
  }

  // If the sentiment is less than the sentiment threshold, sell
  return TradeSignal.SELL;
};
