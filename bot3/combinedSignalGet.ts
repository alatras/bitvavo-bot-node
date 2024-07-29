import { getBidAskSpread } from "./bidAskSpreadGet";
import {
  calculateCombinedSignal,
  CombinedSignal,
  CombinedSignalTracker,
} from "./combinedSignalCalculator";
import { getTickerPrice } from "./get-ticker-price";
import { getMarketDepth } from "./marketDepthGet";
import { getOrderBookImbalance } from "./orderBookImbalanceGet";
import { getOrderFlowImbalance } from "./orderFlowImbalanceGet";
import { getVWAP } from "./VWAPGet";

export const getCombinedSignal = async (): Promise<CombinedSignal> => {
  const orderBookImbalance = await getOrderBookImbalance();
  const bidAskSpread = await getBidAskSpread();
  const marketDepth = await getMarketDepth();
  const vwap = await getVWAP();
  const orderFlowImbalance = await getOrderFlowImbalance();
  const currentPrice = await getTickerPrice();

  const combinedSignal = calculateCombinedSignal(
    orderBookImbalance,
    bidAskSpread.percentageSpread,
    marketDepth,
    vwap,
    orderFlowImbalance,
    currentPrice
  );

  console.log(`Combined Signal: ${combinedSignal.signal}`);
  console.log(`Interpretation: ${combinedSignal.interpretation}`);
  console.log(`Confidence: ${combinedSignal.confidence}`);

  // Using the Combined Signal Tracker
  const tracker = new CombinedSignalTracker();
  tracker.addMeasurement(combinedSignal.signal);
  // ... add more measurements over time ...

  // Get average signal over the last hour
  const avgSignal = tracker.getAverageSignal(3600000);
  console.log(`Average Signal (last hour): ${avgSignal}`);

  // Detect reversals over the last day
  const reversal = tracker.detectReversal(86400000);
  console.log(`Reversal detected: ${reversal.reversed}`);
  console.log(`Description: ${reversal.description}`);

  return combinedSignal;
};

