import { getAsset } from "./get-asset";

/**
 * Check if there is enough EUR available
 * @returns True if there is enough EUR available
 */
export async function haveEur(): Promise<number> {
  const eurAsset = await getAsset('EUR');
  console.log('EUR Asset:', eurAsset);
  if (!eurAsset) {
    return 0;
  }

  console.log('EUR Asset Available:', eurAsset.available);
  return Number(eurAsset.available);
}