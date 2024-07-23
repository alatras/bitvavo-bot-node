import { TradeSignal } from "../analysis/analyze-trading";

/**
 * Calculate the price amount to trade
 * @param midPrice The mid price to calculate the price amount to trade for
 * @returns The price amount to trade
 */
export function calculatePriceAmountToTrade(midPrice: number, operation: TradeSignal): number {
  let adjustedPrice5 = Number(midPrice.toPrecision(5));

  if (operation === TradeSignal.BUY) {
    adjustedPrice5 = Number(midPrice.toPrecision(5)) -
      Number(process.env.BUY_PRICE_LIMIT_ORDER_MARGIN); // Buy at a lower price
  }

  if (operation === TradeSignal.SELL) {
    adjustedPrice5 = Number(midPrice.toPrecision(5)) +
      Number(process.env.SELL_PRICE_LIMIT_ORDER_MARGIN); // Sell at a higher price
  }

  // TODO: optimize the above values

  return adjustedPrice5;
}