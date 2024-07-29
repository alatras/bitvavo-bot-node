/**
 * @fileoverview This module provides functionality to calculate the Volume Weighted Average Price (VWAP)
 * based on the provided order book data from Bitvavo exchange.
 */

import logger from "../src/utils/logger";
import { VWAP } from "./combinedSignalCalculator";

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
 * Calculates the Volume Weighted Average Price (VWAP) from the order book.
 * 
 * @param book - The order book data.
 * @param depth - The number of levels to consider from the top of the book (default: 10).
 * @returns An object containing VWAP for bids and asks, and the overall VWAP.
 */
export function calculateVWAP(book: Book, depth: number = 10): VWAP {
  const calculateSideVWAP = (orders: Order[]): number => {
    let sumPriceVolume = 0;
    let sumVolume = 0;

    orders.slice(0, depth).forEach(([price, volume]) => {
      const numPrice = parseFloat(price);
      const numVolume = parseFloat(volume);
      sumPriceVolume += numPrice * numVolume;
      sumVolume += numVolume;
    });

    return sumVolume > 0 ? sumPriceVolume / sumVolume : 0;
  };

  const bidVWAP = calculateSideVWAP(book.bids);
  const askVWAP = calculateSideVWAP(book.asks);

  // Overall VWAP as the average of bid and ask VWAPs
  const overallVWAP = (bidVWAP + askVWAP) / 2;

  return {
    bidVWAP: Number(bidVWAP.toFixed(8)),
    askVWAP: Number(askVWAP.toFixed(8)),
    overallVWAP: Number(overallVWAP.toFixed(8))
  };
}

/**
 * Analyzes the VWAP in relation to the current market price and provides insights.
 * 
 * @param book - The order book data.
 * @param depth - The number of levels to consider from the top of the book (default: 10).
 * @returns An object containing VWAP analysis and market insights.
 */
export function analyzeVWAP(book: Book, depth: number = 10): {
  vwap: {
    bidVWAP: number;
    askVWAP: number;
    overallVWAP: number;
  };
  currentPrice: number;
  priceToVWAPRatio: number;
  interpretation: string;
} {
  const vwap = calculateVWAP(book, depth);
  const currentPrice = (parseFloat(book.bids[0][0]) + parseFloat(book.asks[0][0])) / 2;
  const priceToVWAPRatio = currentPrice / vwap.overallVWAP;

  let interpretation: string;
  if (priceToVWAPRatio > 1.05) {
    interpretation = "Current price is significantly above VWAP. The market may be overbought.";
  } else if (priceToVWAPRatio > 1.01) {
    interpretation = "Current price is slightly above VWAP. The market shows some bullish sentiment.";
  } else if (priceToVWAPRatio < 0.95) {
    interpretation = "Current price is significantly below VWAP. The market may be oversold.";
  } else if (priceToVWAPRatio < 0.99) {
    interpretation = "Current price is slightly below VWAP. The market shows some bearish sentiment.";
  } else {
    interpretation = "Current price is close to VWAP. The market appears to be in balance.";
  }

  return {
    vwap,
    currentPrice: Number(currentPrice.toFixed(8)),
    priceToVWAPRatio: Number(priceToVWAPRatio.toFixed(4)),
    interpretation
  };
}

/**
 * Tracks VWAP over time and provides historical analysis.
 */
export class VWAPTracker {
  private vwapHistory: { timestamp: number; vwap: number }[] = [];

  /**
   * Adds a new VWAP measurement to the history.
   * 
   * @param book - The current order book data.
   * @param depth - The number of levels to consider from the top of the book (default: 10).
   */
  addMeasurement(book: Book, depth: number = 10): void {
    const { overallVWAP } = calculateVWAP(book, depth);
    this.vwapHistory.push({ timestamp: Date.now(), vwap: overallVWAP });

    // Optionally, limit the history to a certain number of entries
    if (this.vwapHistory.length > 1000) {
      this.vwapHistory.shift();
    }
  }

  /**
   * Calculates the average VWAP over a specified time period.
   * 
   * @param duration - The duration in milliseconds to calculate the average over.
   * @returns The average VWAP.
   */
  getAverageVWAP(duration: number): number {
    const cutoffTime = Date.now() - duration;
    const relevantVWAPs = this.vwapHistory.filter(entry => entry.timestamp >= cutoffTime);

    if (relevantVWAPs.length === 0) {
      return 0;
    }

    const sum = relevantVWAPs.reduce((acc, entry) => acc + entry.vwap, 0);
    return Number((sum / relevantVWAPs.length).toFixed(8));
  }

  /**
   * Calculates the VWAP trend over a specified time period.
   * 
   * @param duration - The duration in milliseconds to calculate the trend over.
   * @returns An object containing the start VWAP, end VWAP, and trend percentage.
   */
  getVWAPTrend(duration: number): {
    startVWAP: number;
    endVWAP: number;
    trendPercentage: number;
  } {
    const cutoffTime = Date.now() - duration;
    const relevantVWAPs = this.vwapHistory.filter(entry => entry.timestamp >= cutoffTime);

    if (relevantVWAPs.length < 2) {
      logger.warning("Insufficient data to calculate VWAP trend.");
    }

    const startVWAP = relevantVWAPs[0].vwap;
    const endVWAP = relevantVWAPs[relevantVWAPs.length - 1].vwap;
    const trendPercentage = ((endVWAP - startVWAP) / startVWAP) * 100;

    return {
      startVWAP: Number(startVWAP.toFixed(8)),
      endVWAP: Number(endVWAP.toFixed(8)),
      trendPercentage: Number(trendPercentage.toFixed(2))
    };
  }
}