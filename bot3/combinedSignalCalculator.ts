/**
 * @fileoverview This module provides functionality to calculate a Combined Signal
 * based on various order book indicators from Bitvavo exchange.
 */

import logger from "../src/utils/logger";

/**
 * Represents the structure of the order book.
 */
interface Book {
  market: string;
  nonce: number;
  bids: [string, string][];
  asks: [string, string][];
}

/**
 * Represents the Market Depth data.
 */
export interface MarketDepth {
  bids: { price: number; cumulativeVolume: number }[];
  asks: { price: number; cumulativeVolume: number }[];
}

/**
 * Represents the VWAP data.
 */
export interface VWAP {
  bidVWAP: number;
  askVWAP: number;
  overallVWAP: number;
}

/**
 * Represents the Combined Signal with its interpretation and confidence level.
 */
export interface CombinedSignal {
  signal: number;
  interpretation: string;
  confidence: "Low" | "Medium" | "High";
}

/**
 * Calculates the Combined Signal based on multiple order book indicators.
 *
 * @param orderBookImbalance - The Order Book Imbalance value (-1 to 1).
 * @param bidAskSpreadPercentage - The Bid-Ask Spread as a percentage.
 * @param marketDepth - The Market Depth data.
 * @param vwap - The VWAP data.
 * @param orderFlowImbalance - The Order Flow Imbalance value (-1 to 1).
 * @param currentPrice - The current market price.
 * @returns An object containing the combined signal and its interpretation.
 */
export function calculateCombinedSignal(
  orderBookImbalance: number,
  bidAskSpreadPercentage: number,
  marketDepth: MarketDepth,
  vwap: VWAP,
  orderFlowImbalance: number,
  currentPrice: number
): CombinedSignal {
  // Normalize and weight each indicator
  const weights = {
    orderBookImbalance: 0.25,
    bidAskSpread: 0.15,
    marketDepth: 0.2,
    vwap: 0.25,
    orderFlowImbalance: 0.15,
  };

  // Order Book Imbalance is already between -1 and 1
  const weightedOBI = orderBookImbalance * weights.orderBookImbalance;

  // Normalize Bid-Ask Spread (assuming 5% is very high, adjust as needed)
  const normalizedSpread = Math.min(bidAskSpreadPercentage / 5, 1);
  const weightedSpread = (1 - normalizedSpread) * weights.bidAskSpread;

  // Market Depth (compare bid and ask volumes)
  const bidVolume =
    marketDepth.bids[marketDepth.bids.length - 1].cumulativeVolume;
  const askVolume =
    marketDepth.asks[marketDepth.asks.length - 1].cumulativeVolume;
  const depthImbalance = (bidVolume - askVolume) / (bidVolume + askVolume);
  const weightedDepth = depthImbalance * weights.marketDepth;

  // VWAP (compare current price to VWAP)
  const vwapImbalance = (currentPrice - vwap.overallVWAP) / vwap.overallVWAP;
  const weightedVWAP = Math.max(Math.min(vwapImbalance, 1), -1) * weights.vwap;

  // Order Flow Imbalance is already between -1 and 1
  const weightedOFI = orderFlowImbalance * weights.orderFlowImbalance;

  // Calculate combined signal
  const signal =
    weightedOBI + weightedSpread + weightedDepth + weightedVWAP + weightedOFI;

  // Interpret the signal
  let interpretation: string;
  if (signal > 0.5) {
    interpretation = "Strong bullish signal. Consider buying.";
  } else if (signal > 0.2) {
    interpretation = "Moderate bullish signal. Market conditions favor buying.";
  } else if (signal < -0.5) {
    interpretation = "Strong bearish signal. Consider selling.";
  } else if (signal < -0.2) {
    interpretation =
      "Moderate bearish signal. Market conditions favor selling.";
  } else {
    interpretation = "Neutral signal. Market conditions are balanced.";
  }

  // Determine confidence level
  const divergence = Math.max(
    Math.abs(weightedOBI - weightedOFI),
    Math.abs(weightedOBI - weightedDepth),
    Math.abs(weightedOFI - weightedDepth)
  );

  let confidence: "Low" | "Medium" | "High";
  if (divergence > 0.3) {
    confidence = "Low";
  } else if (divergence > 0.1) {
    confidence = "Medium";
  } else {
    confidence = "High";
  }

  return {
    signal: Number(signal.toFixed(4)),
    interpretation,
    confidence,
  };
}

/**
 * Tracks Combined Signal over time and provides historical analysis.
 */
export class CombinedSignalTracker {
  private signalHistory: { timestamp: number; signal: number }[] = [];

  /**
   * Adds a new Combined Signal measurement to the history.
   *
   * @param signal - The calculated combined signal.
   */
  addMeasurement(signal: number): void {
    this.signalHistory.push({ timestamp: Date.now(), signal });

    // Optionally, limit the history to a certain number of entries
    if (this.signalHistory.length > 1000) {
      this.signalHistory.shift();
    }
  }

  /**
   * Calculates the average Combined Signal over a specified time period.
   *
   * @param duration - The duration in milliseconds to calculate the average over.
   * @returns The average Combined Signal.
   */
  getAverageSignal(duration: number): number {
    const cutoffTime = Date.now() - duration;
    const relevantSignals = this.signalHistory.filter(
      (entry) => entry.timestamp >= cutoffTime
    );

    if (relevantSignals.length === 0) {
      return 0;
    }

    const sum = relevantSignals.reduce((acc, entry) => acc + entry.signal, 0);
    return Number((sum / relevantSignals.length).toFixed(4));
  }

  /**
   * Detects trend reversals in the Combined Signal over a specified time period.
   *
   * @param duration - The duration in milliseconds to analyze.
   * @param threshold - The threshold for considering a change a reversal (default: 0.4).
   * @returns An object describing any detected reversal.
   */
  detectReversal(
    duration: number,
    threshold: number = 0.4
  ): {
    reversed: boolean;
    fromSignal: number;
    toSignal: number;
    description: string;
  } {
    const cutoffTime = Date.now() - duration;
    const relevantSignals = this.signalHistory.filter(
      (entry) => entry.timestamp >= cutoffTime
    );

    if (relevantSignals.length < 2) {
      logger.warning("Insufficient data to detect reversal");
    }

    const startSignal = relevantSignals[0].signal;
    const endSignal = relevantSignals[relevantSignals.length - 1].signal;
    const signalChange = endSignal - startSignal;

    const reversed =
      Math.abs(signalChange) >= threshold &&
      ((startSignal > 0 && endSignal < 0) ||
        (startSignal < 0 && endSignal > 0));

    let description: string;
    if (reversed) {
      description =
        startSignal > 0
          ? "Detected a bearish reversal. The market sentiment has shifted from bullish to bearish."
          : "Detected a bullish reversal. The market sentiment has shifted from bearish to bullish.";
    } else {
      description =
        "No significant reversal detected. The market sentiment remains relatively stable.";
    }

    return {
      reversed,
      fromSignal: Number(startSignal.toFixed(4)),
      toSignal: Number(endSignal.toFixed(4)),
      description,
    };
  }
}
