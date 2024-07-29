import { MarketDepth } from "./combinedSignalCalculator";
import { getBooks } from "./get-book";
import {
  calculateMarketDepth,
  analyzeMarketDepth,
  calculatePriceImpact,
} from "./marketDepthCalculator";

export const getMarketDepth = async (): Promise<MarketDepth> => {
  const bookData = await getBooks();
  const depth = calculateMarketDepth(bookData, 15);

  // ** All bellow is for logging purposes **
  console.log("Bid Depth:", depth.bids);
  console.log("Ask Depth:", depth.asks);

  const analysis = analyzeMarketDepth(bookData);
  console.log(`Total Bid Volume: ${analysis.totalBidVolume}`);
  console.log(`Total Ask Volume: ${analysis.totalAskVolume}`);
  console.log(`Bid/Ask Ratio: ${analysis.bidAskRatio}`);
  console.log(`Interpretation: ${analysis.interpretation}`);

  const orderSize = 10;
  const impact = calculatePriceImpact(bookData, orderSize, "bid");
  console.log(`Estimated Price Impact: ${impact}%`);

  return depth;
};

getMarketDepth();