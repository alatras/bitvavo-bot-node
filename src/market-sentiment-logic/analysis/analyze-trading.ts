import { State } from "..";
import { storeData } from "./store-data";
import { calculateMovingAverage } from "./calculate-moving-average";
import { calculateGuessRatio } from "./calculate-guess-ratio";
import logger from "../../utils/logger";
import { Trading } from "./calculate-order-book-imbalance";
import logControl from "./log-control";

export interface VisibleVolumeCalculationResult {
  bidVolume: number;
  numberOfBids: number;
  askVolume: number;
  numberOfAsks: number;
  lowPrice: number;
  highPrice: number;
  midPrice: number;
}

export enum TradeSignal {
  BUY = "BUY",
  SELL = "SELL",
  HOLD = "HOLD",
}

export interface SentimentResult {
  bidVolumePercentage: number;
  marketSentiment: number;
}

export async function analyzeTrading(
  visibleVolume: VisibleVolumeCalculationResult,
  state: State,
  tradingSignalFindingMethod?: string
): Promise<void> {
  // Store the trading data
  const trading: Trading = {
    ...visibleVolume,
    ...state,
    timestamp: Date.now(),
  };
  await storeData(trading);

  // Calculate the moving average and guess ratio
  const movingAverage = await calculateMovingAverage();

  // Calculate the guess ratio
  const guessRatio = await calculateGuessRatio();

  // Log controls with the guess ratio for future analysis per configuration settings
  logControl(guessRatio, tradingSignalFindingMethod);

  // Log the analysis
  logger.info("Visible Volume:", visibleVolume);
  logger.info(`State:`, state);
  const analysisObject = {
    "Timestamp:": new Date().toISOString(),
    "Moving Average (24h)": movingAverage,
    "Guess Ratio:": guessRatio,
    "Current Mid Price:": state.midPrice,
    "Current Trade Signal": state.tradeSignal,
  };
  logger.info("Analysis:", analysisObject);
}
