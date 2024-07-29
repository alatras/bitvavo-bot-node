import { getBitvavoApi } from "../src/utils/get-bitvavo-api";
import logger from "../src/utils/logger";

/**
 * Fetches the current price for the given trading pair
 * @param pair The trading pair to fetch the current price for
 */
export const getTickerPrice = async (pair = "BTC-EUR"): Promise<number> => {
  try {
    const bitvavo = getBitvavoApi();
    const ticker = await bitvavo.tickerPrice({ market: pair });

    console.log("Current price:", ticker.price);

    return parseFloat(ticker.price);
  } catch (error) {
    logger.error("Error fetching ticker price:", error);
    throw new Error("Failed to fetch ticker price");
  }
};
