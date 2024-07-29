/**
 * @fileoverview This module provides functionality to calculate the Order Book Imbalance
 * based on the provided order book data from Bitvavo exchange.
 */

/**
 * Represents an order in the order book.
 */
type Order = [string, string]; // [price, volume]

/**
 * Represents the structure of the order book.
 */
export interface Book {
  market: string;
  nonce: number;
  bids: Order[];
  asks: Order[];
}

/**
 * Represents the context of the Order Book Imbalance.
 */
export interface OrderBookImbalanceContext {
  imbalance: number;
  interpretation: string;
  midPrice: number;
}

/**
 * Calculates the Order Book Imbalance.
 *
 * @param book - The order book data.
 * @param depth - The number of levels to consider from the top of the book (default: 10).
 * @param threshold - The price range threshold as a percentage from the mid price (default: 0.01 i.e., 1%).
 * @returns The Order Book Imbalance as a number between -1 and 1.
 *          Positive values indicate more buying pressure, negative values indicate more selling pressure.
 */
export function calculateOrderBookImbalance(
  book: Book,
  depth: number = 10,
  threshold: number = 0.01
): number {
  const bids = book.bids.slice(0, depth);
  const asks = book.asks.slice(0, depth);

  if (bids.length === 0 || asks.length === 0) {
    throw new Error("Insufficient data in the order book");
  }

  const midPrice = (parseFloat(bids[0][0]) + parseFloat(asks[0][0])) / 2;
  const priceThreshold = midPrice * threshold;

  let bidVolume = 0;
  let askVolume = 0;

  for (const [price, volume] of bids) {
    if (midPrice - parseFloat(price) <= priceThreshold) {
      bidVolume += parseFloat(volume);
    }
  }

  for (const [price, volume] of asks) {
    if (parseFloat(price) - midPrice <= priceThreshold) {
      askVolume += parseFloat(volume);
    }
  }

  const totalVolume = bidVolume + askVolume;

  if (totalVolume === 0) {
    return 0; // Avoid division by zero
  }

  return (bidVolume - askVolume) / totalVolume;
}

/**
 * Calculates and returns the Order Book Imbalance along with additional context.
 *
 * @param book - The order book data.
 * @param depth - The number of levels to consider from the top of the book (default: 10).
 * @param threshold - The price range threshold as a percentage from the mid price (default: 0.01 i.e., 1%).
 * @returns An object containing the imbalance value and additional context.
 */
export function getOrderBookImbalanceWithContext(
  book: Book,
  depth: number = 10,
  threshold: number = 0.01
): OrderBookImbalanceContext {
  const imbalance = calculateOrderBookImbalance(book, depth, threshold);
  const midPrice =
    (parseFloat(book.bids[0][0]) + parseFloat(book.asks[0][0])) / 2;

  let interpretation: string;
  if (imbalance > 0.5) {
    interpretation = "Strong buying pressure";
  } else if (imbalance > 0.2) {
    interpretation = "Moderate buying pressure";
  } else if (imbalance < -0.5) {
    interpretation = "Strong selling pressure";
  } else if (imbalance < -0.2) {
    interpretation = "Moderate selling pressure";
  } else {
    interpretation = "Relatively balanced";
  }

  return {
    imbalance,
    interpretation,
    midPrice,
  };
}
