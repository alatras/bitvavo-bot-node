import { getAsset } from "./get-asset";

/**
 * Check if BTC is bought
 * @returns If BTC is bought
 */
export async function btcIsBought(): Promise<boolean> {
  const btcAsset = await getAsset('BTC');
  if (!btcAsset) {
    return false;
  }
  return btcAsset && btcAsset.available > '0.001'; // TODO: check if 0.001 is a good threshold
}