import { VWAP } from "./combinedSignalCalculator";
import { getBooks } from "./get-book";
import { calculateVWAP, analyzeVWAP, VWAPTracker } from "./VWAPCalculator";

export const getVWAP = async (): Promise<VWAP> => {
  const bookData = await getBooks();

  // Basic VWAP calculation
  const vwap = calculateVWAP(bookData, 15); // Calculate VWAP using top 15 levels

  // For logging purposes
  console.log(`Bid VWAP: ${vwap.bidVWAP}`);
  console.log(`Ask VWAP: ${vwap.askVWAP}`);
  console.log(`Overall VWAP: ${vwap.overallVWAP}`);
  
  // Analyze VWAP
  const analysis = analyzeVWAP(bookData);
  console.log(`Current Price: ${analysis.currentPrice}`);
  console.log(`Price to VWAP Ratio: ${analysis.priceToVWAPRatio}`);
  console.log(`Interpretation: ${analysis.interpretation}`);

  // Using the VWAP Tracker
  const tracker = new VWAPTracker();
  tracker.addMeasurement(bookData);
  // ... add more measurements over time ...

  // Get average VWAP over the last hour
  const averageVWAP = tracker.getAverageVWAP(3600000);
  console.log(`Average VWAP (last hour): ${averageVWAP}`);

  // Get VWAP trend over the last day
  const trend = tracker.getVWAPTrend(86400000);
  console.log(`VWAP Trend (last day): ${trend.trendPercentage}%`);

  return vwap;
};
