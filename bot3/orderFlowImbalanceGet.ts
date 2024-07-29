import { getBooks } from "./get-book";
import {
  calculateOrderFlowImbalance,
  analyzeOrderFlowImbalance,
  OrderFlowImbalanceTracker,
} from "./orderFlowImbalanceCalculator";

export const getOrderFlowImbalance = async (): Promise<number> => {
  const bookData = await getBooks();

  // Basic Order Flow Imbalance calculation
  const imbalance = calculateOrderFlowImbalance(bookData, 10); // Consider top 10 levels

  // ** All bellow is for logging purposes **
  console.log(`Order Flow Imbalance: ${imbalance}`);

  // Analyze Order Flow Imbalance
  const analysis = analyzeOrderFlowImbalance(bookData);
  console.log(`Imbalance: ${analysis.imbalance}`);
  console.log(`Interpretation: ${analysis.interpretation}`);
  console.log(`Market Pressure: ${analysis.pressure}`);

  // Using the Order Flow Imbalance Tracker
  const tracker = new OrderFlowImbalanceTracker();
  tracker.addMeasurement(bookData);
  // ... add more measurements over time ...

  // Get average imbalance over the last hour
  const averageImbalance = tracker.getAverageImbalance(3600000);
  console.log(`Average Imbalance (last hour): ${averageImbalance}`);

  // Detect significant changes over the last day
  const change = tracker.detectSignificantChange(86400000);
  console.log(`Imbalance Change: ${change.change}`);
  console.log(`Description: ${change.description}`);

  return imbalance;
};

getOrderFlowImbalance();