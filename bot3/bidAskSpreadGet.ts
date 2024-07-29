import { 
  calculateBidAskSpread, 
  getBidAskSpreadWithContext, 
  BidAskSpreadTracker, 
  Spread
} from './bidAskSpreadCalculator';
import { getBooks } from './get-book';

export const getBidAskSpread = async (): Promise<Spread> => {
  const bookData = await getBooks();
  const spread = calculateBidAskSpread(bookData);

  // For logging purposes
  console.log(`Absolute Spread: ${spread.absoluteSpread}`);
  console.log(`Percentage Spread: ${spread.percentageSpread}%`);

  const spreadContext = getBidAskSpreadWithContext(bookData);
  console.log(`Interpretation: ${spreadContext.interpretation}`);
  console.log(`Liquidity Assessment: ${spreadContext.liquidityAssessment}`);

  const tracker = new BidAskSpreadTracker();
  tracker.addMeasurement(bookData);
  const averageSpread = tracker.getAverageSpread(3600000); // Average over last hour
  console.log(`Average Spread (last hour): ${averageSpread}%`);

  return spread;
}
