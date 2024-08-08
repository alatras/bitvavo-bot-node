import { getBitvavoApi } from "../utils/get-bitvavo-api";
import logger from "../utils/logger";
import redis from "../utils/redis-client";
import { Book } from "./calculate-visible-volume";

const CACHE_TTL = 5; // Cache time-to-live in seconds

/**
 * Fetches the order book for the given trading pair
 * @param pair The trading pair to fetch the order book for
 */
export const getBooks = async (pair = "BTC-EUR"): Promise<Book> => {
  const depth = Number(process.env.ORDER_BOOK_DEPTH);
  const cacheKey = `book:${pair}:${depth}`;

  try {
    if (process.env.CACHE_BOOK_ORDERS === "true") {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        const { book, cachedDepth } = JSON.parse(cachedData);
        if (cachedDepth === depth) {
          console.log(
            `Retrieved from cache (depth: ${cachedDepth}) - asks:`,
            book.asks.length,
            "bids:",
            book.bids.length
          );
          return book;
        }
      }
    }

    // If not cached or depth mismatch, fetch from API
    const bitvavo = getBitvavoApi();
    const book: Book = await bitvavo.book(pair, { depth });
    console.log(
      `Fetched from API (depth: ${depth}) - asks:`,
      book.asks.length,
      "bids:",
      book.bids.length
    );

    // Cache the result with depth information
    const cacheData = JSON.stringify({ book, cachedDepth: depth });
    await redis.set(cacheKey, cacheData, "EX", CACHE_TTL);

    return book;
  } catch (error) {
    logger.error("Error fetching book:", error);
    throw new Error("Failed to fetch book data");
  }
};