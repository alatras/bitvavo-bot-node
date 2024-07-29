import logger from "../utils/logger";

export type Order = [string, string]; // [price, volume]

export type Book = {
  market: string;
  nonce: number;
  bids: Order[];
  asks: Order[];
};

export type ProcessedOrder = {
  price: number;
  volume: number;
};

export interface VisibleVolumeCalculationResult {
  bidVolume: number;
  numberOfBids: number;
  askVolume: number;
  numberOfAsks: number;
  midPrice: number;
  weightedAveragePrice: number;
  bidAskSpread: number;
  orderBookImbalance: number;
}


/**
 * Calculates the visible volume for the given order book
 * @param book The order book to calculate the visible volume for
 * @param depthPercentage The depth percentage to calculate the visible volume for
 */
export function calculateVisibleVolume(book: Book): VisibleVolumeCalculationResult {
  // Helper function to process orders
  const processOrders = (orders: [string, string][]): ProcessedOrder[] =>
    orders.map(([price, volume]) => ({
      price: parseFloat(price),
      volume: parseFloat(volume)
    }));

  // Sort bids (descending) and asks (ascending)
  const sortedBids = processOrders(book.bids).sort((a, b) => b.price - a.price);
  const sortedAsks = processOrders(book.asks).sort((a, b) => a.price - b.price);

  // Calculate mid price
  const midPrice = (sortedBids[0].price + sortedAsks[0].price) / 2;

  // Calculate cumulative volumes
  const calculateCumulativeVolume = (orders: ProcessedOrder[]): number => {
    return orders.reduce((sum, order) => sum + order.volume, 0);
  };

  const bidVolume = calculateCumulativeVolume(sortedBids);
  const askVolume = calculateCumulativeVolume(sortedAsks);

  // Calculate weighted average price
  const calculateWeightedAveragePrice = (orders: ProcessedOrder[]): number => {
    const totalVolume = orders.reduce((sum, order) => sum + order.volume, 0);
    const weightedSum = orders.reduce((sum, order) => sum + order.price * order.volume, 0);
    return weightedSum / totalVolume;
  };

  const weightedAveragePrice = (calculateWeightedAveragePrice(sortedBids) + calculateWeightedAveragePrice(sortedAsks)) / 2;

  // Calculate bid-ask spread
  const bidAskSpread = sortedAsks[0].price - sortedBids[0].price;

  // Calculate order book imbalance
  const orderBookImbalance = (bidVolume - askVolume) / (bidVolume + askVolume);

  return {
    bidVolume: parseFloat(bidVolume.toFixed(8)),
    numberOfBids: sortedBids.length,
    askVolume: parseFloat(askVolume.toFixed(8)),
    numberOfAsks: sortedAsks.length,
    midPrice: parseFloat(midPrice.toFixed(2)),
    weightedAveragePrice: parseFloat(weightedAveragePrice.toFixed(2)),
    bidAskSpread: parseFloat(bidAskSpread.toFixed(2)),
    orderBookImbalance: parseFloat(orderBookImbalance.toFixed(4))
  };
}