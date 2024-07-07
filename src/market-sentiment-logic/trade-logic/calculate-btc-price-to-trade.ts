import { TradeSignal } from "../calculate-trade-signal";

/**
 * Calculate the price amount to trade
 * @param midPrice The mid price to calculate the price amount to trade for
 * @returns The price amount to trade
 */
export function calculatePriceAmountToTrade(midPrice: number, operation: TradeSignal): number {
  let adjustedPrice5 = Number(midPrice.toPrecision(5));

  if (operation === TradeSignal.BUY) {
    adjustedPrice5 = Number(midPrice.toPrecision(5)) - 10; // Buy at a lower price
  }

  if (operation === TradeSignal.SELL) {
    adjustedPrice5 = Number(midPrice.toPrecision(5)) + 5; // Sell at a higher price
  }

  // TODO: check if 10 is a good value to add or subtract and not blocking the trade

  return adjustedPrice5;
}