import { Book } from "../src/market-sentiment-logic/calculate-visible-volume";
import { getBitvavoApi } from "../src/utils/get-bitvavo-api";
import logger from "../src/utils/logger";

/**
 * Fetches the order book for the given trading pair
 * @param pair The trading pair to fetch the order book for
 */
export const getBooks = async (pair = 'BTC-EUR'): Promise<Book> => {
  try {
    const bitvavo = getBitvavoApi();
    const book: Book = await bitvavo.book(pair, { depth: 500 });

    console.log('asks:', book.asks.length, "bids:",book.bids.length);

    return book;
  } catch (error) {
    logger.error('Error fetching book:', error);
    throw new Error('Failed to fetch book data');
  }
}
