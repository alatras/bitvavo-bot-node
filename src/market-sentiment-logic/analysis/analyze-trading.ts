import { State } from '..';
import { storeData } from './store-data';
import { calculateMovingAverage } from './calculate-moving-average';
import { calculateGuessRatio } from './calculate-guess-ratio';
import logger from '../../utils/logger';

export interface CalculationResult {
  bidVolume: number;
  numberOfBids: number;
  askVolume: number;
  numberOfAsks: number;
  lowPrice: number;
  highPrice: number;
  midPrice: number;
}

export enum TradeSignal {
  BUY = 'BUY',
  SELL = 'SELL',
}

export interface SentimentResult {
  bidVolumePercentage: number;
  marketSentiment: number;
}

export async function analyzeTrading(visibleVolume: CalculationResult, state: State): Promise<void> {
  await storeData(visibleVolume, state);
  const movingAverage = await calculateMovingAverage();
  const guessRatio = await calculateGuessRatio();

  const analysis = `
    Timestamp: ${new Date().toISOString()}
    Moving Average (24h): ${movingAverage}
    Guess Ratio: ${guessRatio}
    Current Mid Price: ${state.midPrice}
    Current Trade Signal: ${state.tradeSignal}
  `;
  logger.info("Analysis:", analysis);

  // Reconstruct analysis in the console
  const analysisObject = {
    "Moving Average (24h)": movingAverage,
    "Guess Ratio:": guessRatio,
    "Current Mid Price:": state.midPrice,
    "Current Trade Signal": state.tradeSignal,
  };
  console.log(analysisObject);
}
