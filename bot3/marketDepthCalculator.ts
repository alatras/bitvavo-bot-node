/**
 * @fileoverview This module provides functionality to calculate and analyze Market Depth
 * based on the provided order book data from Bitvavo exchange.
 */

import logger from "../src/utils/logger";
import { MarketDepth } from "./combinedSignalCalculator";

/**
 * Represents an order in the order book.
 */
type Order = [string, string]; // [price, volume]

/**
 * Represents the structure of the order book.
 */
interface Book {
  market: string;
  nonce: number;
  bids: Order[];
  asks: Order[];
}

/**
 * Represents cumulative volume at a specific price level.
 */
interface DepthLevel {
  price: number;
  cumulativeVolume: number;
}

/**
 * Calculates the Market Depth from the order book.
 *
 * @param book - The order book data.
 * @param levels - The number of price levels to include (default: 10).
 * @returns An object containing bid and ask depth levels.
 */
export function calculateMarketDepth(
  book: Book,
  levels: number = 10
): MarketDepth {
  const calculateCumulativeVolume = (
    orders: Order[],
    isAsk: boolean
  ): DepthLevel[] => {
    let cumulativeVolume = 0;
    return orders.slice(0, levels).map(([price, volume]) => {
      cumulativeVolume += parseFloat(volume);
      return {
        price: parseFloat(price),
        cumulativeVolume: Number(cumulativeVolume.toFixed(8)),
      };
    });
  };

  const bids = calculateCumulativeVolume(book.bids, false);
  const asks = calculateCumulativeVolume(book.asks, true);

  return { bids, asks };
}

/**
 * Analyzes the Market Depth and provides insights.
 *
 * @param book - The order book data.
 * @param levels - The number of price levels to include (default: 10).
 * @returns An object containing depth analysis and insights.
 */
export function analyzeMarketDepth(
  book: Book,
  levels: number = 10
): {
  depth: { bids: DepthLevel[]; asks: DepthLevel[] };
  totalBidVolume: number;
  totalAskVolume: number;
  bidAskRatio: number;
  interpretation: string;
} {
  const depth = calculateMarketDepth(book, levels);

  const totalBidVolume = depth.bids[depth.bids.length - 1].cumulativeVolume;
  const totalAskVolume = depth.asks[depth.asks.length - 1].cumulativeVolume;
  const bidAskRatio = totalBidVolume / totalAskVolume;

  let interpretation: string;
  if (bidAskRatio > 1.5) {
    interpretation =
      "Strong buying pressure: Significantly more volume on the bid side.";
  } else if (bidAskRatio > 1.2) {
    interpretation = "Moderate buying pressure: More volume on the bid side.";
  } else if (bidAskRatio < 0.67) {
    interpretation =
      "Strong selling pressure: Significantly more volume on the ask side.";
  } else if (bidAskRatio < 0.83) {
    interpretation = "Moderate selling pressure: More volume on the ask side.";
  } else {
    interpretation =
      "Relatively balanced market: Similar volumes on both sides.";
  }

  return {
    depth,
    totalBidVolume: Number(totalBidVolume.toFixed(8)),
    totalAskVolume: Number(totalAskVolume.toFixed(8)),
    bidAskRatio: Number(bidAskRatio.toFixed(4)),
    interpretation,
  };
}

/**
 * Calculates the price impact for a given order size.
 *
 * @param book - The order book data.
 * @param orderSize - The size of the order to calculate impact for.
 * @param side - The side of the order book to calculate impact for ('bid' or 'ask').
 * @returns The estimated price impact as a percentage.
 */
export function calculatePriceImpact(
  book: Book,
  orderSize: number,
  side: "bid" | "ask"
): number {
  const orders = side === "bid" ? book.asks : book.bids;
  let remainingSize = orderSize;
  let totalCost = 0;

  for (const [price, volume] of orders) {
    const orderPrice = parseFloat(price);
    const orderVolume = parseFloat(volume);

    if (remainingSize <= orderVolume) {
      totalCost += remainingSize * orderPrice;
      break;
    } else {
      totalCost += orderVolume * orderPrice;
      remainingSize -= orderVolume;
    }

    if (remainingSize <= 0) break;
  }

  if (remainingSize > 0) {
    logger.warning(
      `Insufficient liquidity in the order book for order size ${orderSize}`
    );
  }

  const avgPrice = totalCost / orderSize;
  const bestPrice = parseFloat(orders[0][0]);
  const priceImpact =
    side === "bid"
      ? ((avgPrice - bestPrice) / bestPrice) * 100
      : ((bestPrice - avgPrice) / bestPrice) * 100;

  return Number(priceImpact.toFixed(4));
}
