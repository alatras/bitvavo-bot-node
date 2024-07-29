/**
 * @fileoverview This module provides functionality to calculate and analyze the Order Book Slope
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
 * Calculates the Order Book Slope for a given side of the book.
 * 
 * @param orders - Array of orders (either bids or asks).
 * @param depth - Number of levels to consider for slope calculation (default: 10).
 * @returns The calculated slope.
 */
function calculateSlope(orders: Order[], depth: number = 10): number {
  const levels = orders.slice(0, depth);
  const prices = levels.map(order => parseFloat(order[0]));
  const volumes = levels.map(order => parseFloat(order[1]));

  const cumulativeVolumes = volumes.reduce((acc, vol, i) => {
    acc.push((acc[i - 1] || 0) + vol);
    return acc;
  }, [] as number[]);

  const n = prices.length;
  const sumXY = prices.reduce((sum, price, i) => sum + price * cumulativeVolumes[i], 0);
  const sumX = prices.reduce((sum, price) => sum + price, 0);
  const sumY = cumulativeVolumes.reduce((sum, vol) => sum + vol, 0);
  const sumXSquared = prices.reduce((sum, price) => sum + price * price, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXSquared - sumX * sumX);
  return slope;
}

/**
 * Calculates the Order Book Slope for both bid and ask sides.
 * 
 * @param book - The order book data.
 * @param depth - Number of levels to consider for slope calculation (default: 10).
 * @returns An object containing bid and ask slopes.
 */
export function calculateOrderBookSlope(book: Book, depth: number = 10): {
  bidSlope: number;
  askSlope: number;
} {
  const bidSlope = calculateSlope(book.bids, depth);
  const askSlope = calculateSlope(book.asks, depth);

  return {
    bidSlope: Number(bidSlope.toFixed(6)),
    askSlope: Number(askSlope.toFixed(6))
  };
}

/**
 * Analyzes the Order Book Slope and provides market insights.
 * 
 * @param book - The order book data.
 * @param depth - Number of levels to consider for slope calculation (default: 10).
 * @returns An object containing slope values and market interpretation.
 */
export function analyzeOrderBookSlope(book: Book, depth: number = 10): {
  bidSlope: number;
  askSlope: number;
  interpretation: string;
  bidStrength: 'Strong' | 'Moderate' | 'Weak';
  askStrength: 'Strong' | 'Moderate' | 'Weak';
} {
  const { bidSlope, askSlope } = calculateOrderBookSlope(book, depth);

  let interpretation: string;
  let bidStrength: 'Strong' | 'Moderate' | 'Weak';
  let askStrength: 'Strong' | 'Moderate' | 'Weak';

  // Determine strength based on absolute slope values
  // These thresholds can be adjusted based on typical values for your specific market
  bidStrength = Math.abs(bidSlope) > 0.5 ? 'Strong' : (Math.abs(bidSlope) > 0.2 ? 'Moderate' : 'Weak');
  askStrength = Math.abs(askSlope) > 0.5 ? 'Strong' : (Math.abs(askSlope) > 0.2 ? 'Moderate' : 'Weak');

  if (Math.abs(bidSlope) > Math.abs(askSlope) * 1.5) {
    interpretation = "The bid side of the order book is significantly steeper. This suggests strong buying pressure and potentially good support for the current price.";
  } else if (Math.abs(askSlope) > Math.abs(bidSlope) * 1.5) {
    interpretation = "The ask side of the order book is significantly steeper. This suggests strong selling pressure and potentially weak resistance for upward price movements.";
  } else if (Math.abs(bidSlope) > Math.abs(askSlope) * 1.1) {
    interpretation = "The bid side of the order book is slightly steeper. This suggests moderate buying pressure.";
  } else if (Math.abs(askSlope) > Math.abs(bidSlope) * 1.1) {
    interpretation = "The ask side of the order book is slightly steeper. This suggests moderate selling pressure.";
  } else {
    interpretation = "The order book slopes are relatively balanced. This suggests equilibrium between buying and selling pressure.";
  }

  return {
    bidSlope,
    askSlope,
    interpretation,
    bidStrength,
    askStrength
  };
}

/**
 * Tracks Order Book Slope over time and provides historical analysis.
 */
export class OrderBookSlopeTracker {
  private slopeHistory: { timestamp: number; bidSlope: number; askSlope: number }[] = [];

  /**
   * Adds a new Order Book Slope measurement to the history.
   * 
   * @param book - The current order book data.
   * @param depth - Number of levels to consider for slope calculation (default: 10).
   */
  addMeasurement(book: Book, depth: number = 10): void {
    const { bidSlope, askSlope } = calculateOrderBookSlope(book, depth);
    this.slopeHistory.push({ timestamp: Date.now(), bidSlope, askSlope });

    // Optionally, limit the history to a certain number of entries
    if (this.slopeHistory.length > 1000) {
      this.slopeHistory.shift();
    }
  }

  /**
   * Calculates the average Order Book Slope over a specified time period.
   * 
   * @param duration - The duration in milliseconds to calculate the average over.
   * @returns An object containing the average bid and ask slopes.
   */
  getAverageSlope(duration: number): { avgBidSlope: number; avgAskSlope: number } {
    const cutoffTime = Date.now() - duration;
    const relevantSlopes = this.slopeHistory.filter(entry => entry.timestamp >= cutoffTime);

    if (relevantSlopes.length === 0) {
      return { avgBidSlope: 0, avgAskSlope: 0 };
    }

    const sumBidSlopes = relevantSlopes.reduce((sum, entry) => sum + entry.bidSlope, 0);
    const sumAskSlopes = relevantSlopes.reduce((sum, entry) => sum + entry.askSlope, 0);

    return {
      avgBidSlope: Number((sumBidSlopes / relevantSlopes.length).toFixed(6)),
      avgAskSlope: Number((sumAskSlopes / relevantSlopes.length).toFixed(6))
    };
  }

  /**
   * Detects significant changes in Order Book Slope over a specified time period.
   * 
   * @param duration - The duration in milliseconds to analyze.
   * @param threshold - The threshold for considering a change significant (default: 30%).
   * @returns An object describing the changes in bid and ask slopes.
   */
  detectSignificantChanges(duration: number, threshold: number = 30): {
    bidChange: { startSlope: number; endSlope: number; percentChange: number };
    askChange: { startSlope: number; endSlope: number; percentChange: number };
    description: string;
  } {
    const cutoffTime = Date.now() - duration;
    const relevantSlopes = this.slopeHistory.filter(entry => entry.timestamp >= cutoffTime);

    if (relevantSlopes.length < 2) {
      throw new Error("Insufficient data to detect significant changes");
    }

    const startBidSlope = relevantSlopes[0].bidSlope;
    const endBidSlope = relevantSlopes[relevantSlopes.length - 1].bidSlope;
    const startAskSlope = relevantSlopes[0].askSlope;
    const endAskSlope = relevantSlopes[relevantSlopes.length - 1].askSlope;

    const bidPercentChange = ((endBidSlope - startBidSlope) / Math.abs(startBidSlope)) * 100;
    const askPercentChange = ((endAskSlope - startAskSlope) / Math.abs(startAskSlope)) * 100;

    let description = "";
    if (Math.abs(bidPercentChange) >= threshold) {
      description += bidPercentChange > 0 
        ? "Significant increase in bid slope steepness. This suggests growing buying pressure. "
        : "Significant decrease in bid slope steepness. This suggests weakening buying pressure. ";
    }
    if (Math.abs(askPercentChange) >= threshold) {
      description += askPercentChange > 0 
        ? "Significant increase in ask slope steepness. This suggests growing selling pressure. "
        : "Significant decrease in ask slope steepness. This suggests weakening selling pressure. ";
    }
    if (description === "") {
      description = "No significant changes in order book slopes detected. Market pressure remains stable.";
    }

    return {
      bidChange: {
        startSlope: Number(startBidSlope.toFixed(6)),
        endSlope: Number(endBidSlope.toFixed(6)),
        percentChange: Number(bidPercentChange.toFixed(2))
      },
      askChange: {
        startSlope: Number(startAskSlope.toFixed(6)),
        endSlope: Number(endAskSlope.toFixed(6)),
        percentChange: Number(askPercentChange.toFixed(2))
      },
      description
    };
  }
}
