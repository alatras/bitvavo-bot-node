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
  state: State
): Promise<void> {
  const trading: Trading = {
    ...visibleVolume,
    ...state,
    timestamp: Date.now(),
  };
  await storeData(trading);
  const movingAverage = await calculateMovingAverage();
  const guessRatio = await calculateGuessRatio();

  logControl(guessRatio);

  const analysis = `
    Timestamp: ${new Date().toISOString()}
    Moving Average (24h): ${movingAverage}
    Guess Ratio: ${guessRatio}
    Current Mid Price: ${state.midPrice}
    Current Trade Signal: ${state.tradeSignal}
  `;
  logger.infoFileOnly(analysis);

  // Reconstruct analysis in the console
  const analysisObject = {
    "Moving Average (24h)": movingAverage,
    "Guess Ratio:": guessRatio,
    "Current Mid Price:": state.midPrice,
    "Current Trade Signal": state.tradeSignal,
  };
  console.log("Analysis:", analysisObject);
}
