/**
 * @fileoverview This module provides functionality to calculate the Bid-Ask Spread
 * based on the provided order book data from Bitvavo exchange.
 */

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
 * Represents the Bid-Ask Spread.
 */
export interface Spread {
  absoluteSpread: number;
  percentageSpread: number;
}

/**
 * Calculates the Bid-Ask Spread from the order book.
 *
 * @param book - The order book data.
 * @returns An object containing the absolute and percentage spread.
 * @throws Error if there's insufficient data in the order book.
 */
export function calculateBidAskSpread(book: Book): Spread {
  if (book.bids.length === 0 || book.asks.length === 0) {
    throw new Error("Insufficient data in the order book");
  }

  const bestBid = parseFloat(book.bids[0][0]);
  const bestAsk = parseFloat(book.asks[0][0]);

  const absoluteSpread = bestAsk - bestBid;
  const midPrice = (bestBid + bestAsk) / 2;
  const percentageSpread = (absoluteSpread / midPrice) * 100;

  return {
    absoluteSpread: Number(absoluteSpread.toFixed(8)),
    percentageSpread: Number(percentageSpread.toFixed(4)),
  };
}

/**
 * Calculates the Bid-Ask Spread and provides additional context.
 *
 * @param book - The order book data.
 * @returns An object containing the spread values and additional context.
 */
export function getBidAskSpreadWithContext(book: Book): {
  absoluteSpread: number;
  percentageSpread: number;
  interpretation: string;
  liquidityAssessment: string;
} {
  const { absoluteSpread, percentageSpread } = calculateBidAskSpread(book);

  let interpretation: string;
  let liquidityAssessment: string;

  // These thresholds can be adjusted based on the specific market and typical spread ranges
  if (percentageSpread < 0.1) {
    interpretation = "Very tight spread";
    liquidityAssessment = "Highly liquid market";
  } else if (percentageSpread < 0.3) {
    interpretation = "Narrow spread";
    liquidityAssessment = "Liquid market";
  } else if (percentageSpread < 0.5) {
    interpretation = "Moderate spread";
    liquidityAssessment = "Moderately liquid market";
  } else if (percentageSpread < 1) {
    interpretation = "Wide spread";
    liquidityAssessment = "Less liquid market";
  } else {
    interpretation = "Very wide spread";
    liquidityAssessment = "Illiquid market or potential volatility";
  }

  return {
    absoluteSpread,
    percentageSpread,
    interpretation,
    liquidityAssessment,
  };
}

/**
 * Tracks the Bid-Ask Spread over time.
 */
export class BidAskSpreadTracker {
  private spreadHistory: { timestamp: number; spread: number }[] = [];

  /**
   * Adds a new spread measurement to the history.
   *
   * @param book - The current order book data.
   */
  addMeasurement(book: Book): void {
    const { percentageSpread } = calculateBidAskSpread(book);
    this.spreadHistory.push({
      timestamp: Date.now(),
      spread: percentageSpread,
    });

    // Optionally, limit the history to a certain number of entries
    if (this.spreadHistory.length > 1000) {
      this.spreadHistory.shift();
    }
  }

  /**
   * Calculates the average spread over a specified time period.
   *
   * @param duration - The duration in milliseconds to calculate the average over.
   * @returns The average spread as a percentage.
   */
  getAverageSpread(duration: number): number {
    const cutoffTime = Date.now() - duration;
    const relevantSpreads = this.spreadHistory.filter(
      (entry) => entry.timestamp >= cutoffTime
    );

    if (relevantSpreads.length === 0) {
      return 0;
    }

    const sum = relevantSpreads.reduce((acc, entry) => acc + entry.spread, 0);
    return Number((sum / relevantSpreads.length).toFixed(4));
  }
}
