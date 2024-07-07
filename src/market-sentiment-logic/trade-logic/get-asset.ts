import { getBitvavoApi } from "../../utils/get-bitvavo-api";
import logger from "../../utils/logger";

export type Asset = {
  symbol: string;
  available: string;
  inOrder: string;
}

export async function getAsset(symbol = 'BTC'): Promise<Asset> {
  try {
    const bitvavo = getBitvavoApi();
    const response = await bitvavo.balance({ symbol });
    logger.info("BTC assets:", response);

    if (response.length === 0) {
      throw new Error('No BTC assets found');
    }

    // Find the asset with the highest total BTC amount (available + inOrder)
    const highestBtcAsset = response.reduce((max: Asset, asset: Asset) => {
      const totalCurrent = parseFloat(asset.available) + parseFloat(asset.inOrder);
      const totalMax = parseFloat(max.available) + parseFloat(max.inOrder);
      return totalCurrent > totalMax ? asset : max;
    });

    return highestBtcAsset;
  } catch (error) {
    logger.error('Error fetching BTC asset', error);
    console.log(error);
    throw new Error('Error fetching BTC asset');
  }
}