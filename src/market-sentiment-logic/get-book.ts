import { getBitvavoApi } from "../utils/get-bitvavo-api";
import logger from "../utils/logger";
import redis from "../utils/redis-client";
import { Book } from "./calculate-visible-volume";

/**
 * Fetches the order book for the given trading pair
 * @param pair The trading pair to fetch the order book for
 */
const CACHE_TTL = 10; // Cache time-to-live in seconds

/**
 * Fetches the order book for the given trading pair
 * @param pair The trading pair to fetch the order book for
 */
export const getBooks = async (pair = "BTC-EUR"): Promise<Book> => {
  const cacheKey = `book:${pair}`;

  try {
    if (process.env.CACHE_BOOK_ORDERS === "true") {
      const cachedBook = await redis.get(cacheKey);
      if (cachedBook) {
        const book: Book = JSON.parse(cachedBook);
        console.log(
          "Retrieved from cache - asks:",
          book.asks.length,
          "bids:",
          book.bids.length
        );
        return book;
      }
    }

    // If not cached, fetch from API
    const depth = Number(process.env.ORDER_BOOK_DEPTH);
    const bitvavo = getBitvavoApi();
    const book: Book = await bitvavo.book(pair, { depth });
    console.log(
      "Fetched from API - asks:",
      book.asks.length,
      "bids:",
      book.bids.length
    );

    // Cache the result
    await redis.set(cacheKey, JSON.stringify(book), "EX", CACHE_TTL);

    return book;
  } catch (error) {
    logger.error("Error fetching book:", error);
    throw new Error("Failed to fetch book data");
  }
};
