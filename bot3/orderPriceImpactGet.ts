import { getBooks } from "./get-book";
import {
  calculateOrderPriceImpact,
  analyzeOrderPriceImpact,
  estimateMaxOrderSize,
  OrderPriceImpactTracker,
} from "./orderPriceImpactCalculator";

const run = async () => {
  const bookData = await getBooks();

  // Calculate Order Price Impact for a specific order size
  const impact = calculateOrderPriceImpact(bookData, 10, "bid"); // Impact of buying 10 units
  console.log(`Price Impact: ${impact}%`);

  // Analyze impacts for multiple order sizes
  const analysis = analyzeOrderPriceImpact(bookData, [1, 5, 10, 50, 100]);
  console.log(`Interpretation: ${analysis.interpretation}`);

  // Estimate maximum order size for a given impact threshold
  const maxSize = estimateMaxOrderSize(bookData, 0.5, "ask"); // Max sell order size with 0.5% impact
  console.log(`Estimated Max Order Size: ${maxSize}`);

  // Using the Order Price Impact Tracker
  const tracker = new OrderPriceImpactTracker();
  tracker.addMeasurement(bookData, 10); // Track impact for order size of 10
  // ... add more measurements over time ...

  // Get average impact over the last hour
  const avgImpact = tracker.getAverageImpact(3600000);
  console.log(`Avg Bid Impact (last hour): ${avgImpact.avgBidImpact}%`);
  console.log(`Avg Ask Impact (last hour): ${avgImpact.avgAskImpact}%`);

  // Detect significant changes over the last day
  const changes = tracker.detectSignificantChanges(86400000);
  console.log(`Changes: ${changes.description}`);
};

run();