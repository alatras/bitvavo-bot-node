import { getAsset } from "./get-asset";

/**
 * Calculate the amount of BTC to sell
 * @returns The amount of BTC to sell
 */
export async function calculateBtcAmountToSell(): Promise<number> {
  const btcAsset = await getAsset('BTC');
  if (!btcAsset) {
    throw new Error('No BTC assets found');
  }

  return parseFloat(btcAsset.available);
}
