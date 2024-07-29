/**
 * @fileoverview This module provides functionality to generate trade decisions
 * based on the Combined Signal from order book indicators.
 */

/**
 * Represents the possible trade decisions.
 */
export type TradeDecision =
  | "STRONG BUY"
  | "BUY"
  | "HOLD"
  | "SELL"
  | "STRONG SELL";

/**
 * Represents the confidence level of the Combined Signal.
 */
type Confidence = "Low" | "Medium" | "High";

/**
 * Represents the output of the Combined Signal calculation.
 */
interface CombinedSignalOutput {
  signal: number;
  interpretation: string;
  confidence: Confidence;
}

export interface TradeDecisionResponse {
  decision: TradeDecision;
  reason: string;
  riskLevel: "Low" | "Medium" | "High";
}

/**
 * Generates a trade decision based on the Combined Signal.
 *
 * @param combinedSignal - The output from the Combined Signal calculation.
 * @returns An object containing the trade decision and additional context.
 */
export function generateTradeDecision(
  combinedSignal: CombinedSignalOutput
): TradeDecisionResponse {
  const { signal, confidence } = combinedSignal;

  let decision: TradeDecision;
  let reason: string;
  let riskLevel: "Low" | "Medium" | "High";

  // Define thresholds for different signal strengths
  const strongThreshold = 0.7;
  const moderateThreshold = 0.3;

  // Determine the base decision based on signal strength
  if (signal >= strongThreshold) {
    decision = "STRONG BUY";
    reason = "The combined signal indicates a very strong bullish trend.";
  } else if (signal >= moderateThreshold) {
    decision = "BUY";
    reason = "The combined signal shows a moderate bullish trend.";
  } else if (signal <= -strongThreshold) {
    decision = "STRONG SELL";
    reason = "The combined signal indicates a very strong bearish trend.";
  } else if (signal <= -moderateThreshold) {
    decision = "SELL";
    reason = "The combined signal shows a moderate bearish trend.";
  } else {
    decision = "HOLD";
    reason = "The combined signal suggests a neutral market condition.";
  }

  // Adjust decision based on confidence level
  if (confidence === "Low") {
    if (decision === "STRONG BUY") {
      decision = "BUY";
      reason +=
        " However, due to low confidence, a cautious BUY is recommended instead of a strong buy.";
    } else if (decision === "STRONG SELL") {
      decision = "SELL";
      reason +=
        " However, due to low confidence, a cautious SELL is recommended instead of a strong sell.";
    } else if (decision !== "HOLD") {
      decision = "HOLD";
      reason =
        "While the signal suggests action, the low confidence level recommends holding for now.";
    }
  }

  // Determine risk level
  if (confidence === "Low" || Math.abs(signal) < moderateThreshold) {
    riskLevel = "High";
  } else if (confidence === "Medium" || Math.abs(signal) < strongThreshold) {
    riskLevel = "Medium";
  } else {
    riskLevel = "Low";
  }

  return { decision, reason, riskLevel };
}

/**
 * Tracks trade decisions over time and provides analysis.
 */
export class TradeDecisionTracker {
  private decisionHistory: { timestamp: number; decision: TradeDecision }[] =
    [];

  /**
   * Adds a new trade decision to the history.
   *
   * @param decision - The trade decision.
   */
  addDecision(decision: TradeDecision): void {
    this.decisionHistory.push({ timestamp: Date.now(), decision });

    // Optionally, limit the history to a certain number of entries
    if (this.decisionHistory.length > 1000) {
      this.decisionHistory.shift();
    }
  }

  /**
   * Analyzes the trade decisions over a specified time period.
   *
   * @param duration - The duration in milliseconds to analyze.
   * @returns An object containing analysis of the trade decisions.
   */
  analyzeDecisions(duration: number): {
    totalDecisions: number;
    buyCount: number;
    sellCount: number;
    holdCount: number;
    dominantTrend: "Bullish" | "Bearish" | "Neutral";
  } {
    const cutoffTime = Date.now() - duration;
    const relevantDecisions = this.decisionHistory.filter(
      (entry) => entry.timestamp >= cutoffTime
    );

    const buyCount = relevantDecisions.filter(
      (d) => d.decision === "BUY" || d.decision === "STRONG BUY"
    ).length;
    const sellCount = relevantDecisions.filter(
      (d) => d.decision === "SELL" || d.decision === "STRONG SELL"
    ).length;
    const holdCount = relevantDecisions.filter(
      (d) => d.decision === "HOLD"
    ).length;

    let dominantTrend: "Bullish" | "Bearish" | "Neutral";
    if (buyCount > sellCount && buyCount > holdCount) {
      dominantTrend = "Bullish";
    } else if (sellCount > buyCount && sellCount > holdCount) {
      dominantTrend = "Bearish";
    } else {
      dominantTrend = "Neutral";
    }

    return {
      totalDecisions: relevantDecisions.length,
      buyCount,
      sellCount,
      holdCount,
      dominantTrend,
    };
  }

  /**
   * Detects if there's been a consistent trend in decisions over a specified time period.
   *
   * @param duration - The duration in milliseconds to analyze.
   * @param consistencyThreshold - The threshold for considering a trend consistent (default: 0.7).
   * @returns An object describing the detected trend, if any.
   */
  detectConsistentTrend(
    duration: number,
    consistencyThreshold: number = 0.7
  ): {
    trendDetected: boolean;
    trend: "Bullish" | "Bearish" | "Neutral" | "None";
    consistency: number;
  } {
    const analysis = this.analyzeDecisions(duration);

    const totalDirectionalDecisions = analysis.buyCount + analysis.sellCount;
    const buyConsistency = analysis.buyCount / totalDirectionalDecisions;
    const sellConsistency = analysis.sellCount / totalDirectionalDecisions;
    const holdConsistency = analysis.holdCount / analysis.totalDecisions;

    if (buyConsistency >= consistencyThreshold) {
      return {
        trendDetected: true,
        trend: "Bullish",
        consistency: buyConsistency,
      };
    } else if (sellConsistency >= consistencyThreshold) {
      return {
        trendDetected: true,
        trend: "Bearish",
        consistency: sellConsistency,
      };
    } else if (holdConsistency >= consistencyThreshold) {
      return {
        trendDetected: true,
        trend: "Neutral",
        consistency: holdConsistency,
      };
    } else {
      return {
        trendDetected: false,
        trend: "None",
        consistency: Math.max(buyConsistency, sellConsistency, holdConsistency),
      };
    }
  }
}
