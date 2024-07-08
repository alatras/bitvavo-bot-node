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
  if (sentiment.marketSentiment > Number(process.env.SENTIMENT_THRESHOLD)) {
    return TradeSignal.BUY;
  }
  return TradeSignal.SELL;
}