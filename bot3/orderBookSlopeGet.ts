import { getBooks } from "./get-book";
import {
  calculateOrderBookSlope,
  analyzeOrderBookSlope,
  OrderBookSlopeTracker,
} from "./orderBookSlopeCalculator";

const run = async () => {
  // Get order book data
  const bookData = await getBooks();

  // Calculate Order Book Slope
  const slopes = calculateOrderBookSlope(bookData, 15); // Consider top 15 levels
  console.log(`Bid Slope: ${slopes.bidSlope}, Ask Slope: ${slopes.askSlope}`);

  // ** All bellow is for logging purposes **
  const analysis = analyzeOrderBookSlope(bookData);
  console.log(`Interpretation: ${analysis.interpretation}`);
  console.log(
    `Bid Strength: ${analysis.bidStrength}, Ask Strength: ${analysis.askStrength}`
  );

  // Using the Order Book Slope Tracker
  const tracker = new OrderBookSlopeTracker();
  tracker.addMeasurement(bookData);
  // ... add more measurements over time ...

  // Get average slopes over the last hour
  const avgSlopes = tracker.getAverageSlope(3600000);
  console.log(`Avg Bid Slope (last hour): ${avgSlopes.avgBidSlope}`);
  console.log(`Avg Ask Slope (last hour): ${avgSlopes.avgAskSlope}`);

  // Detect significant changes over the last day
  const changes = tracker.detectSignificantChanges(86400000);
  console.log(`Changes: ${changes.description}`);
};

run();