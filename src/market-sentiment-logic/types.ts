export enum TradeSignal {
  BUY = "BUY",
  SELL = "SELL",
  HOLD = "HOLD",
}

export interface Trading {
  bidVolume: number;
  numberOfBids: number;
  askVolume: number;
  numberOfAsks: number;
  lowPrice: number;
  highPrice: number;
  midPrice: number;
  tradeSignal: TradeSignal;
  marketSentiment: SentimentResult;
  sentimentThreshold: number;
  orderBookDepth: number;
  timestamp: number;
  instanceId: string;
}

export interface SentimentResult {
  bidVolumePercentage: number;
  marketSentiment: number;
}