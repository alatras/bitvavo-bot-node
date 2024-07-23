import logger from "../../utils/logger";
import redis from "../../utils/redis-client";
import { SentimentResult, TradeSignal } from "./analyze-trading";

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

export interface Trading {
  bidVolume: number;
  numberOfBids: number;
  askVolume: number;
  numberOfAsks: number;
  lowPrice: number;
  highPrice: number;
  midPrice: number;
  tradeSignal: TradeSignal;
  marketSentiment: SentimentResult;
  sentimentThreshold: number;
  depthThreshold: number;
  timestamp: number;
}

export type ImbalanceData = {
  weightedImbalance: number;
  volumeImbalance: number;
  priceWeightedImbalance: number;
  depthImbalance: number;
  recentTrend: number;
}

export async function calculateImprovedOrderBookImbalance(): Promise<ImbalanceData> {
  const keys = await redis.keys('trading:*');
  const data = await Promise.all(keys.map(key => redis.hgetall(key)));
  const sortedData = data
    .map(item => ({
      ...item,
      timestamp: parseInt(item.timestamp)
    }))
    .sort((a, b) => b.timestamp - a.timestamp);

  const recentData = sortedData.slice(0, 10); // Consider only the 10 most recent entries

  const imbalances = recentData.map((item, index) => {
    const trading = item as unknown as Trading; // Type assertion
    const bidVolume = parseFloat(trading.bidVolume.toString());
    const askVolume = parseFloat(trading.askVolume.toString());
    const numberOfBids = parseFloat(trading.numberOfBids.toString());
    const numberOfAsks = parseFloat(trading.numberOfAsks.toString());
    const midPrice = parseFloat(trading.midPrice.toString());
    const depthThreshold = parseFloat(trading.depthThreshold.toString());

    // Basic volume imbalance
    const volumeImbalance = (bidVolume - askVolume) / (bidVolume + askVolume);

    // Price-weighted imbalance
    const priceWeightedImbalance = ((bidVolume * midPrice) - (askVolume * midPrice)) /
      ((bidVolume * midPrice) + (askVolume * midPrice));

    // Depth imbalance
    const bidDepth = bidVolume / numberOfBids;
    const askDepth = askVolume / numberOfAsks;
    const depthImbalance = (bidDepth - askDepth) / (bidDepth + askDepth);

    // Time-weighted factor (more recent data has higher weight)
    const timeWeight = 1 - (index * 0.1); // Weight from 1.0 to 0.1

    return {
      volumeImbalance,
      priceWeightedImbalance,
      depthImbalance,
      timeWeight
    };
  });

  // Calculate weighted averages
  const weightedImbalance = imbalances.reduce((sum, imb) =>
    sum + (imb.volumeImbalance * imb.timeWeight), 0) /
    imbalances.reduce((sum, imb) => sum + imb.timeWeight, 0);

  const volumeImbalance = imbalances.reduce((sum, imb) => sum + imb.volumeImbalance, 0) / imbalances.length;
  const priceWeightedImbalance = imbalances.reduce((sum, imb) => sum + imb.priceWeightedImbalance, 0) / imbalances.length;
  const depthImbalance = imbalances.reduce((sum, imb) => sum + imb.depthImbalance, 0) / imbalances.length;

  // Calculate recent trend
  const recentTrend = calculateRecentTrend(recentData);

  return {
    weightedImbalance,
    volumeImbalance,
    priceWeightedImbalance,
    depthImbalance,
    recentTrend
  };
}

function calculateRecentTrend(recentData: any[]): number {
  const prices = recentData.map(item => parseFloat(item.midPrice));
  const trend = prices.slice(0, -1).reduce((sum, price, index) =>
    sum + (prices[index + 1] - price) / price, 0) / (prices.length - 1);
  return trend;
}

export function interpretImbalance(imbalanceData: ImbalanceData): string {
  const { weightedImbalance, volumeImbalance, priceWeightedImbalance, depthImbalance, recentTrend } = imbalanceData;

  let interpretation = '';

  if (weightedImbalance > 0.1) {
    interpretation += 'Strong buying pressure. ';
  } else if (weightedImbalance < -0.1) {
    interpretation += 'Strong selling pressure. ';
  } else {
    interpretation += 'Relatively balanced order book. ';
  }

  if (Math.abs(volumeImbalance - priceWeightedImbalance) > 0.1) {
    interpretation += 'Significant price impact on imbalance. ';
  }

  if (Math.abs(depthImbalance) > 0.2) {
    interpretation += 'Notable difference in order sizes between bids and asks. ';
  }

  if (recentTrend > 0.001) {
    interpretation += 'Recent upward price trend. ';
  } else if (recentTrend < -0.001) {
    interpretation += 'Recent downward price trend. ';
  } else {
    interpretation += 'Price has been relatively stable recently. ';
  }

  return interpretation;
}

export async function makeTradeDecisionBasedOnImbalance(): Promise<TradeSignal> {
  const imbalanceData = await calculateImprovedOrderBookImbalance();
  const interpretation = interpretImbalance(imbalanceData);

  // console.log("Market Analysis:", interpretation);
  logger.OK("\nMarket Analysis:", interpretation);

  // Example decision logic (you should customize this based on backtesting)
  let signal: TradeSignal
  if (imbalanceData.weightedImbalance > 0.15 && imbalanceData.recentTrend > 0) {
    signal = TradeSignal.BUY;
  } else if (imbalanceData.weightedImbalance < -0.15 && imbalanceData.recentTrend < 0) {
    signal = TradeSignal.SELL;
  } else {
    signal = TradeSignal.HOLD;
  }

  console.log("Trade Signal:", signal);

  return signal;
}