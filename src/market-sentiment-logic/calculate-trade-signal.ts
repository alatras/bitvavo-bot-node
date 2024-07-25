import { TradeSignal } from './analysis/analyze-trading';
import { SentimentResult } from './calculate-market-sentiment';

/**
 * Calculates the trade signal based on the market sentiment
 * @param sentiment The sentiment to calculate the trade signal for
 */
export const calculateTradeSignal = (
  sentiment: SentimentResult,
): TradeSignal => {
  const threshold = Number(process.env.SENTIMENT_THRESHOLD);
  
  const difference = Math.abs(sentiment.marketSentiment - threshold);
  const hold = Number(process.env.PRICE_CHANGE_THRESHOLD_FOR_ANALYSIS);
  if (difference <= hold) {
    return TradeSignal.HOLD;
  }
  
  if (sentiment.marketSentiment > threshold) {
    return TradeSignal.BUY;
  }
  
  return TradeSignal.SELL;
}