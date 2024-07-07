import { SentimentBotState } from '..';
import { TradeSignal } from '../calculate-trade-signal';
import { buy } from './buy-btc';
import { sell } from './sell.btc';

/**
 * Trade BTC based on the trade signal
 * @param state The state of the sentiment bot
 * @param midPrice The mid price to trade for
 * @returns The trade response
 */
export async function trade(
  tradeSignal: TradeSignal,
  midPrice: number
): Promise<void> {
  if (tradeSignal === TradeSignal.BUY) {
    await buy(midPrice);
  } else {
    await sell(midPrice);
  }
}
