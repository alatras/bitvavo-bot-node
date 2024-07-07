import { getBitvavoApi } from "../../utils/get-bitvavo-api";
import logger from "../../utils/logger";
import { TradeSignal } from "../calculate-trade-signal";
import { btcIsBought } from "./btc-is-bought";
import { calculateBtcAmountToBuy } from "./calculate-btc-amount-to-buy";
import { calculatePriceAmountToTrade } from "./calculate-btc-price-to-trade";
import { haveEur } from "./have-eur";

/**
 * Buy BTC
 * @param midPrice The initial mid price to buy for before adjusting
 */
export async function buy(
  midPrice: number
): Promise<void> {
  const btcIsAlreadyBought = await btcIsBought();
  if (btcIsAlreadyBought) {
    logger.warning('BTC is already bought');
    return;
  };

  if (process.env.TRADE !== 'true') {
    logger.warning('Trade is disabled. I would have bought BTC.');
    return;
  }

  const eurAvailable = await haveEur();
  if (eurAvailable < Number(process.env.EUR_AMOUNT)) {
    logger.warning('EUR is not available:', eurAvailable);
    return;
  }

  try {
    const btcAmount = calculateBtcAmountToBuy(midPrice, Number(process.env.EUR_AMOUNT));
    const price = calculatePriceAmountToTrade(midPrice, TradeSignal.BUY);
    const bitvavo = getBitvavoApi();

    console.log('Buying BTC:', btcAmount, 'for price (EUR):', price);
    let buyResponse = await bitvavo.placeOrder(
      'BTC-EUR',
      'buy',
      'limit',
      {
        'amount': `${btcAmount}`, // Amount of BTC to buy
        'price': `${price}` // Price at which to buy BTC
      }
    );
    console.log('Buy Order Response:', buyResponse);
  } catch (error) {
    console.log('Error placing buy order:', error);
    throw new Error('Failed to place buy order');
  }
}