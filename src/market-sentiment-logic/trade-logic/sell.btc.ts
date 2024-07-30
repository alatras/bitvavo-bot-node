import { getBitvavoApi } from "../../utils/get-bitvavo-api";
import logger from "../../utils/logger";
import { TradeSignal } from "../types";
import { calculateBtcAmountToSell } from "./calculate-btc-amount-to-sell";
import { calculatePriceAmountToTrade } from "./calculate-btc-price-to-trade";

/**
 * Sell BTC
 * @param midPrice The initial mid price to sell for before adjusting
 */
export async function sell(
  midPrice: number
): Promise<void> {
  if (process.env.TRADE !== 'true') {
    logger.warning('Trade is disabled. I would have sold BTC.');
    return;
  }

  const btcAmount = await calculateBtcAmountToSell();
  if (btcAmount <= 0.001) {
    logger.warning('No BTC to sell. Available:', btcAmount);
    return
  }

  try {
    const price = calculatePriceAmountToTrade(midPrice, TradeSignal.SELL);
    const bitvavo = getBitvavoApi();

    console.log('Selling BTC:', btcAmount, 'for price (EUR):', price);
    let sellResponse = await bitvavo.placeOrder(
      'BTC-EUR',
      'sell',
      'limit',
      {
        'amount': `${btcAmount}`, // Amount of BTC to sell
        'price': `${price}` // Price at which to sell BTC
      }
    );
    console.log('Sell Order Response:', sellResponse);
  } catch (error) {
    console.log('Error placing sell order:', error);
    throw new Error('Failed to place sell order');
  }
}