/**
 * @fileoverview This module provides functionality to calculate and analyze Order Flow Imbalance
 * based on the provided order book data from Bitvavo exchange.
 */

import logger from "../src/utils/logger";

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
 * Calculates the Order Flow Imbalance from the order book.
 * 
 * @param book - The order book data.
 * @param depth - The number of levels to consider from the top of the book (default: 5).
 * @returns A number representing the Order Flow Imbalance.
 */
export function calculateOrderFlowImbalance(book: Book, depth: number = 5): number {
  const bidVolume = book.bids.slice(0, depth).reduce((sum, [, volume]) => sum + parseFloat(volume), 0);
  const askVolume = book.asks.slice(0, depth).reduce((sum, [, volume]) => sum + parseFloat(volume), 0);

  const totalVolume = bidVolume + askVolume;
  if (totalVolume === 0) return 0;

  // Calculate imbalance: range from -1 (all asks) to 1 (all bids)
  return (bidVolume - askVolume) / totalVolume;
}

/**
 * Analyzes the Order Flow Imbalance and provides market insights.
 * 
 * @param book - The order book data.
 * @param depth - The number of levels to consider from the top of the book (default: 5).
 * @returns An object containing the imbalance value and market interpretation.
 */
export function analyzeOrderFlowImbalance(book: Book, depth: number = 5): {
  imbalance: number;
  interpretation: string;
  pressure: 'Buying' | 'Selling' | 'Neutral';
} {
  const imbalance = calculateOrderFlowImbalance(book, depth);

  let interpretation: string;
  let pressure: 'Buying' | 'Selling' | 'Neutral';

  if (imbalance > 0.5) {
    interpretation = "Strong buying pressure. The market is heavily skewed towards bids.";
    pressure = 'Buying';
  } else if (imbalance > 0.2) {
    interpretation = "Moderate buying pressure. There are more bids than asks in the market.";
    pressure = 'Buying';
  } else if (imbalance < -0.5) {
    interpretation = "Strong selling pressure. The market is heavily skewed towards asks.";
    pressure = 'Selling';
  } else if (imbalance < -0.2) {
    interpretation = "Moderate selling pressure. There are more asks than bids in the market.";
    pressure = 'Selling';
  } else {
    interpretation = "Relatively balanced order flow. The market shows no significant imbalance between bids and asks.";
    pressure = 'Neutral';
  }

  return {
    imbalance: Number(imbalance.toFixed(4)),
    interpretation,
    pressure
  };
}

/**
 * Tracks Order Flow Imbalance over time and provides historical analysis.
 */
export class OrderFlowImbalanceTracker {
  private imbalanceHistory: { timestamp: number; imbalance: number }[] = [];

  /**
   * Adds a new Order Flow Imbalance measurement to the history.
   * 
   * @param book - The current order book data.
   * @param depth - The number of levels to consider from the top of the book (default: 5).
   */
  addMeasurement(book: Book, depth: number = 5): void {
    const imbalance = calculateOrderFlowImbalance(book, depth);
    this.imbalanceHistory.push({ timestamp: Date.now(), imbalance });

    // Optionally, limit the history to a certain number of entries
    if (this.imbalanceHistory.length > 1000) {
      this.imbalanceHistory.shift();
    }
  }

  /**
   * Calculates the average Order Flow Imbalance over a specified time period.
   * 
   * @param duration - The duration in milliseconds to calculate the average over.
   * @returns The average Order Flow Imbalance.
   */
  getAverageImbalance(duration: number): number {
    const cutoffTime = Date.now() - duration;
    const relevantImbalances = this.imbalanceHistory.filter(entry => entry.timestamp >= cutoffTime);

    if (relevantImbalances.length === 0) {
      return 0;
    }

    const sum = relevantImbalances.reduce((acc, entry) => acc + entry.imbalance, 0);
    return Number((sum / relevantImbalances.length).toFixed(4));
  }

  /**
   * Detects significant changes in Order Flow Imbalance over a specified time period.
   * 
   * @param duration - The duration in milliseconds to analyze.
   * @param threshold - The threshold for considering a change significant (default: 0.3).
   * @returns An object containing the start and end imbalances, and a description of the change.
   */
  detectSignificantChange(duration: number, threshold: number = 0.3): {
    startImbalance: number;
    endImbalance: number;
    change: number;
    description: string;
  } {
    const cutoffTime = Date.now() - duration;
    const relevantImbalances = this.imbalanceHistory.filter(entry => entry.timestamp >= cutoffTime);

    if (relevantImbalances.length < 2) {
      logger.warning("Insufficient data to detect significant change");
    }

    const startImbalance = relevantImbalances[0].imbalance;
    const endImbalance = relevantImbalances[relevantImbalances.length - 1].imbalance;
    const change = endImbalance - startImbalance;

    let description: string;
    if (Math.abs(change) >= threshold) {
      if (change > 0) {
        description = "Significant increase in buying pressure";
      } else {
        description = "Significant increase in selling pressure";
      }
    } else {
      description = "No significant change in order flow imbalance";
    }

    return {
      startImbalance: Number(startImbalance.toFixed(4)),
      endImbalance: Number(endImbalance.toFixed(4)),
      change: Number(change.toFixed(4)),
      description
    };
  }
}