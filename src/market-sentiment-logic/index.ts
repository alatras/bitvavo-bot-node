import logger from "../utils/logger";
import { calculateMarketSentiment, SentimentResult } from "./calculate-market-sentiment";
import { calculateTradeSignal, TradeSignal } from "./calculate-trade-signal";
import { calculateVisibleVolume } from "./calculate-visible-volume";
import { getBooks } from "./get-book";
import { trade } from "./trade-logic";

export type SentimentBotState = {
  tradeSignal: TradeSignal;
  marketSentiment: SentimentResult;
  sentimentThreshold: number;
  midPrice: number;
  depthThreshold: number;
}


/**
 * Starts the sentiment bot for the given market
 * @param market The market to start the sentiment bot for
 * @param depthPercentage The depth percentage to calculate the visible volume for
 */
export async function startMarketSentimentCycle(
  market: string = 'BTC-EUR',
  depthPercentage: number = 0.08
): Promise<void> {
  // Fetch the order book for the given market
  const book = await getBooks(market);

  // Calculate the visible volume for the given order book
  const visibleVolume = calculateVisibleVolume(book, depthPercentage);

  // Calculate the market sentiment for the given visible
  const marketSentiment = calculateMarketSentiment(visibleVolume);

  // Calculate the trade signal based on the market sentiment
  const tradeSignal = calculateTradeSignal(marketSentiment);

  // Create the state object for the sentiment bot
  const state = {
    tradeSignal,
    marketSentiment,
    sentimentThreshold: Number(process.env.SENTIMENT_THRESHOLD),
    midPrice: visibleVolume.midPrice,
    depthThreshold: Number(process.env.DEPTH_THRESHOLD)
  };
  logger.info(`State:`, state);

  // Execute the trade based on the calculated trade signal
  await trade(state.tradeSignal, visibleVolume.midPrice);
}