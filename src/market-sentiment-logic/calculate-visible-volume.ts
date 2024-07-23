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

export type VisibleVolumeCalculationResult = {
  bidVolume: number;
  numberOfBids: number;
  askVolume: number;
  numberOfAsks: number;
  lowPrice: number;
  highPrice: number;
  midPrice: number;
};


/**
 * Calculates the visible volume for the given order book
 * @param book The order book to calculate the visible volume for
 * @param depthPercentage The depth percentage to calculate the visible volume for
 */
export function calculateVisibleVolume(book: Book, depthPercentage: number = 0.08): VisibleVolumeCalculationResult {
  // Helper function to process orders
  const processOrders = (orders: Order[]): ProcessedOrder[] =>
    orders.map(([price, volume]) => ({
      price: parseFloat(price),
      volume: parseFloat(volume)
    }));

  // Sort bids (descending) and asks (ascending)
  const sortedBids = processOrders(book.bids).sort((a, b) => b.price - a.price);
  const sortedAsks = processOrders(book.asks).sort((a, b) => a.price - b.price);

  // Calculate mid price
  const midPrice = (sortedBids[0].price + sortedAsks[0].price) / 2;

  // Calculate price range
  const lowPrice = midPrice * (1 - depthPercentage);
  const highPrice = midPrice * (1 + depthPercentage);

  // Calculate cumulative volumes within range
  const calculateCumulativeVolume = (orders: ProcessedOrder[], compareFunc: (price: number) => boolean): number => {
    let cumVolume = 0;
    for (let order of orders) {
      if (compareFunc(order.price)) {
        cumVolume += order.volume;
      } else {
        break;
      }
    }
    return cumVolume;
  };

  const bidVolume = calculateCumulativeVolume(sortedBids, price => price >= lowPrice);
  const askVolume = calculateCumulativeVolume(sortedAsks, price => price <= highPrice);

  return {
    bidVolume: parseFloat(bidVolume.toFixed(2)),
    numberOfBids: book.bids.length,
    askVolume: parseFloat(askVolume.toFixed(2)),
    numberOfAsks: book.asks.length,
    lowPrice: parseFloat(lowPrice.toFixed(2)),
    highPrice: parseFloat(highPrice.toFixed(2)),
    midPrice: parseFloat(midPrice.toFixed(2))
  };
}