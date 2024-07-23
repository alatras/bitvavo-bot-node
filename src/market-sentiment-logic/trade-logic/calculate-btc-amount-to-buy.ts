/**
 * Calculates the amount of BTC that can be bought with a given EUR amount.
 * @param btcPrice The current price of one Bitcoin in EUR.
 * @param eurAmount The amount of EUR to be spent on buying Bitcoin.
 */
export function calculateBtcAmountToBuy(
  btcPrice: number,
  eurAmount: number
): number {
  if (btcPrice <= 0) {
    throw new Error("Bitcoin price must be greater than zero.");
  }

  const btcAmount = (eurAmount / btcPrice);  // Subtracting 0.001 BTC to account for trading fees and slippage
  return parseFloat(btcAmount.toFixed(6));
}
