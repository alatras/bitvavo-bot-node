import { CalculationResult } from './calculate-visible-volume';

export type SentimentResult = {
  bidVolumePercentage: number;
  marketSentiment: number;
};

/**
 * Calculates the market sentiment based on the given volume result
 * @param volumeResult The volume result to calculate the market sentiment for
 */
export function calculateMarketSentiment(volumeResult: CalculationResult): SentimentResult {
  const { bidVolume, askVolume } = volumeResult;
  const totalVolume = bidVolume + askVolume;

  // Calculate bid volume percentage
  const bidVolumePercentage = (bidVolume / totalVolume) * 100;

  // Calculate market sentiment
  const rawSentiment = (bidVolumePercentage - 50) * 2;
  const marketSentiment = Math.max(0, Math.min(100, 50 + rawSentiment));

  return {
    bidVolumePercentage: parseFloat(bidVolumePercentage.toFixed(2)),
    marketSentiment: parseFloat(marketSentiment.toFixed(2))
  };
}