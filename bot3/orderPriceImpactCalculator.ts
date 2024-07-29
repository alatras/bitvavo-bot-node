/**
 * @fileoverview This module provides functionality to calculate and analyze Order Price Impact
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
 * Calculates the Order Price Impact for a given order size.
 * 
 * @param book - The order book data.
 * @param orderSize - The size of the order to calculate impact for.
 * @param side - The side of the order book to calculate impact for ('bid' or 'ask').
 * @returns The estimated price impact as a percentage.
 */
export function calculateOrderPriceImpact(book: Book, orderSize: number, side: 'bid' | 'ask'): number {
  const orders = side === 'bid' ? book.asks : book.bids;
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
    throw new Error("Insufficient liquidity in the order book for the given order size");
  }

  const avgPrice = totalCost / orderSize;
  const bestPrice = parseFloat(orders[0][0]);
  const priceImpact = side === 'bid' 
    ? ((avgPrice - bestPrice) / bestPrice) * 100
    : ((bestPrice - avgPrice) / bestPrice) * 100;

  return Number(priceImpact.toFixed(4));
}

/**
 * Analyzes the Order Price Impact for various order sizes and provides market insights.
 * 
 * @param book - The order book data.
 * @param orderSizes - An array of order sizes to analyze.
 * @returns An object containing the impact analysis for both bid and ask sides.
 */
export function analyzeOrderPriceImpact(book: Book, orderSizes: number[]): {
  bidImpacts: { size: number; impact: number }[];
  askImpacts: { size: number; impact: number }[];
  interpretation: string;
} {
  const bidImpacts = orderSizes.map(size => ({
    size,
    impact: calculateOrderPriceImpact(book, size, 'bid')
  }));

  const askImpacts = orderSizes.map(size => ({
    size,
    impact: calculateOrderPriceImpact(book, size, 'ask')
  }));

  // Compare the average impacts
  const avgBidImpact = bidImpacts.reduce((sum, { impact }) => sum + impact, 0) / bidImpacts.length;
  const avgAskImpact = askImpacts.reduce((sum, { impact }) => sum + impact, 0) / askImpacts.length;

  let interpretation: string;
  if (avgBidImpact > avgAskImpact * 1.5) {
    interpretation = "The market shows significantly less liquidity on the buy side. Large buy orders may face substantial price increases.";
  } else if (avgAskImpact > avgBidImpact * 1.5) {
    interpretation = "The market shows significantly less liquidity on the sell side. Large sell orders may face substantial price decreases.";
  } else if (avgBidImpact > avgAskImpact * 1.1) {
    interpretation = "The market shows slightly less liquidity on the buy side. Buy orders may face marginally higher price impacts.";
  } else if (avgAskImpact > avgBidImpact * 1.1) {
    interpretation = "The market shows slightly less liquidity on the sell side. Sell orders may face marginally higher price impacts.";
  } else {
    interpretation = "The market liquidity appears balanced between buy and sell sides. Price impacts are similar for both buy and sell orders.";
  }

  return {
    bidImpacts,
    askImpacts,
    interpretation
  };
}

/**
 * Estimates the maximum order size that can be executed within a given price impact threshold.
 * 
 * @param book - The order book data.
 * @param maxImpact - The maximum acceptable price impact as a percentage.
 * @param side - The side of the order book to calculate for ('bid' or 'ask').
 * @returns The estimated maximum order size.
 */
export function estimateMaxOrderSize(book: Book, maxImpact: number, side: 'bid' | 'ask'): number {
  let low = 0;
  let high = 1000000; // Arbitrary large number, adjust based on your market
  
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    try {
      const impact = calculateOrderPriceImpact(book, mid, side);
      if (Math.abs(impact - maxImpact) < 0.01) {
        return mid;
      } else if (impact < maxImpact) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    } catch (error) {
      high = mid - 1;
    }
  }

  return high; // Return the largest size that doesn't exceed the maxImpact
}

/**
 * Tracks Order Price Impact over time for a specific order size.
 */
export class OrderPriceImpactTracker {
  private impactHistory: { timestamp: number; bidImpact: number; askImpact: number }[] = [];

  /**
   * Adds a new Order Price Impact measurement to the history.
   * 
   * @param book - The current order book data.
   * @param orderSize - The size of the order to track impact for.
   */
  addMeasurement(book: Book, orderSize: number): void {
    const bidImpact = calculateOrderPriceImpact(book, orderSize, 'bid');
    const askImpact = calculateOrderPriceImpact(book, orderSize, 'ask');
    this.impactHistory.push({ timestamp: Date.now(), bidImpact, askImpact });

    // Optionally, limit the history to a certain number of entries
    if (this.impactHistory.length > 1000) {
      this.impactHistory.shift();
    }
  }

  /**
   * Calculates the average Order Price Impact over a specified time period.
   * 
   * @param duration - The duration in milliseconds to calculate the average over.
   * @returns An object containing the average bid and ask impacts.
   */
  getAverageImpact(duration: number): { avgBidImpact: number; avgAskImpact: number } {
    const cutoffTime = Date.now() - duration;
    const relevantImpacts = this.impactHistory.filter(entry => entry.timestamp >= cutoffTime);

    if (relevantImpacts.length === 0) {
      return { avgBidImpact: 0, avgAskImpact: 0 };
    }

    const sumBidImpacts = relevantImpacts.reduce((sum, entry) => sum + entry.bidImpact, 0);
    const sumAskImpacts = relevantImpacts.reduce((sum, entry) => sum + entry.askImpact, 0);

    return {
      avgBidImpact: Number((sumBidImpacts / relevantImpacts.length).toFixed(4)),
      avgAskImpact: Number((sumAskImpacts / relevantImpacts.length).toFixed(4))
    };
  }

  /**
   * Detects significant changes in Order Price Impact over a specified time period.
   * 
   * @param duration - The duration in milliseconds to analyze.
   * @param threshold - The threshold for considering a change significant (default: 20%).
   * @returns An object describing the changes in bid and ask impacts.
   */
  detectSignificantChanges(duration: number, threshold: number = 20): {
    bidChange: { startImpact: number; endImpact: number; percentChange: number };
    askChange: { startImpact: number; endImpact: number; percentChange: number };
    description: string;
  } {
    const cutoffTime = Date.now() - duration;
    const relevantImpacts = this.impactHistory.filter(entry => entry.timestamp >= cutoffTime);

    if (relevantImpacts.length < 2) {
      throw new Error("Insufficient data to detect significant changes");
    }

    const startBidImpact = relevantImpacts[0].bidImpact;
    const endBidImpact = relevantImpacts[relevantImpacts.length - 1].bidImpact;
    const startAskImpact = relevantImpacts[0].askImpact;
    const endAskImpact = relevantImpacts[relevantImpacts.length - 1].askImpact;

    const bidPercentChange = ((endBidImpact - startBidImpact) / startBidImpact) * 100;
    const askPercentChange = ((endAskImpact - startAskImpact) / startAskImpact) * 100;

    let description = "";
    if (Math.abs(bidPercentChange) >= threshold) {
      description += bidPercentChange > 0 
        ? "Significant increase in buy-side price impact. Market buy-side liquidity may have decreased. "
        : "Significant decrease in buy-side price impact. Market buy-side liquidity may have improved. ";
    }
    if (Math.abs(askPercentChange) >= threshold) {
      description += askPercentChange > 0 
        ? "Significant increase in sell-side price impact. Market sell-side liquidity may have decreased. "
        : "Significant decrease in sell-side price impact. Market sell-side liquidity may have improved. ";
    }
    if (description === "") {
      description = "No significant changes in price impact detected. Market liquidity remains stable.";
    }

    return {
      bidChange: {
        startImpact: Number(startBidImpact.toFixed(4)),
        endImpact: Number(endBidImpact.toFixed(4)),
        percentChange: Number(bidPercentChange.toFixed(2))
      },
      askChange: {
        startImpact: Number(startAskImpact.toFixed(4)),
        endImpact: Number(endAskImpact.toFixed(4)),
        percentChange: Number(askPercentChange.toFixed(2))
      },
      description
    };
  }
}