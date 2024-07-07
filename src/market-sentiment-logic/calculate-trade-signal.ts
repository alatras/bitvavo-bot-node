import { SentimentResult } from './calculate-market-sentiment';

export enum TradeSignal {
  BUY = 'BUY',
  SELL = 'SELL',
}

/**
 * Calculates the trade signal based on the market sentiment
 * @param sentiment The sentiment to calculate the trade signal for
 */
export const calculateTradeSignal = (
  sentiment: SentimentResult,
): TradeSignal => {
  const SENTIMENT_THRESHOLD = process.env.SENTIMENT_THRESHOLD; // TODO: test and adjust this threshold
  
  if (sentiment.marketSentiment > Number(SENTIMENT_THRESHOLD)) {
    return TradeSignal.BUY;
  }
  return TradeSignal.SELL;
}