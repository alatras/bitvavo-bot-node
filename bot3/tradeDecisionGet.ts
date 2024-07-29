import {
  generateTradeDecision,
  TradeDecisionResponse,
  TradeDecisionTracker,
} from "./tradeDecisionGenerator";
import { getCombinedSignal } from "./combinedSignalGet";

export const getTradeDecision = async (): Promise<TradeDecisionResponse> => {
  const combinedSignalOutput = await getCombinedSignal();

  const tradeDecision = generateTradeDecision(combinedSignalOutput);

  // ** All bellow is for logging purposes **
  console.log(`Decision: ${tradeDecision.decision}`);
  console.log(`Reason: ${tradeDecision.reason}`);
  console.log(`Risk Level: ${tradeDecision.riskLevel}`);

  // Using the Trade Decision Tracker
  const tracker = new TradeDecisionTracker();
  tracker.addDecision(tradeDecision.decision);
  // ... add more decisions over time ...

  // Analyze decisions over the last day
  const analysis = tracker.analyzeDecisions(86400000);
  console.log(`Dominant Trend: ${analysis.dominantTrend}`);
  console.log(
    `Buy Count: ${analysis.buyCount}, Sell Count: ${analysis.sellCount}, Hold Count: ${analysis.holdCount}`
  );

  // Detect consistent trend over the last week
  const trend = tracker.detectConsistentTrend(7 * 86400000);
  if (trend.trendDetected) {
    console.log(
      `Consistent ${trend.trend} trend detected with ${(
        trend.consistency * 100
      ).toFixed(2)}% consistency`
    );
  } else {
    console.log("No consistent trend detected");
  }

  return tradeDecision;
};
