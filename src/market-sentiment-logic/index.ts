import logger from "../utils/logger";
import { v4 as uuidv4 } from "uuid";
import { analyzeTrading, } from "./analysis/analyze-trading";
import {
  calculateMarketSentiment,
  SentimentResult,
} from "./calculate-market-sentiment";
import { calculateTradeSignal } from "./calculate-trade-signal";
import { calculateVisibleVolume } from "./calculate-visible-volume";
import { getBooks } from "./get-book";
import { trade } from "./trade-logic";
import { TradeSignal } from "./types";

export type SentimentBotState = {
  tradeSignal: TradeSignal;
  marketSentiment: SentimentResult;
  sentimentThreshold: number;
  midPrice: number;
  depthThreshold: number;
};

export type State = {
  tradeSignal: TradeSignal;
  marketSentiment: SentimentResult;
  sentimentThreshold: number;
  midPrice: number;
  orderBookDepth: number;
};

/**
 * Starts the sentiment bot for the given market
 * @param market The market to start the sentiment bot for
 * @param depthPercentage The depth percentage to calculate the visible volume for
 */
export async function startMarketSentimentCycle(
  market: string = "BTC-EUR",
  instanceId: string,
): Promise<void> {
  // Fetch the order book for the given market
  const book = await getBooks(market);

  // Calculate the visible volume for the given order book
  const visibleVolume = calculateVisibleVolume(book);

  // Calculate the market sentiment for the given visible
  const marketSentiment = calculateMarketSentiment(visibleVolume);

  // Calculate the trade signal based on the market sentiment
  const tradeSignal = calculateTradeSignal(marketSentiment);

  // Create the state object for the sentiment bot
  const state: State = {
    tradeSignal,
    marketSentiment,
    sentimentThreshold: Number(process.env.SENTIMENT_THRESHOLD),
    midPrice: visibleVolume.midPrice,
    orderBookDepth: Number(process.env.ORDER_BOOK_DEPTH),
  };
  // Async analyze the trading based on the visible volume and the state
  analyzeTrading(visibleVolume, state, instanceId);

  // Execute the trade based on the calculated trade signal
  await trade(tradeSignal, visibleVolume.midPrice);
}
