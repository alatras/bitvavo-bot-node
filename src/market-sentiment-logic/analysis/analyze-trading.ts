import { State } from "..";
import { storeData } from "./store-data";
import { calculateMovingAverage } from "./calculate-moving-average";
import { calculateGuessRatio } from "./calculate-guess-ratio";
import logger from "../../utils/logger";
import logControl from "./log-control";
import { VisibleVolumeCalculationResult } from "../calculate-visible-volume";
import { Trading } from "../types";

export async function analyzeTrading(
  visibleVolume: VisibleVolumeCalculationResult,
  state: State,
  instanceId: string,
  tradingSignalFindingMethod?: string
): Promise<void> {
  const trading: Trading = {
    ...visibleVolume,
    ...state,
    timestamp: Date.now(),
    lowPrice: 0,
    highPrice: 0,
    instanceId,
  };
  await storeData(trading);

  // Calculate the moving average and guess ratio
  const movingAverage = await calculateMovingAverage(instanceId);

  // Calculate the guess ratio
  const guessRatio = await calculateGuessRatio(instanceId);

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
