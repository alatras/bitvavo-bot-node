import * as dotenv from "dotenv";

const file = process.env.ENV_FILE_NAME;

console.log("file:::::::::", file);

dotenv.config(file ? { path: file } : {});

export function readConfig() {
  if (!process.env.APIKEY) {
    throw new Error("APIKEY not found");
  }

  if (!process.env.APISECRET) {
    throw new Error("APISECRET not found");
  }

  if (!process.env.EUR_AMOUNT) {
    throw new Error("EUR_AMOUNT not found");
  }
  if (isNaN(Number(process.env.EUR_AMOUNT))) {
    throw new Error("EUR_AMOUNT is not a number");
  }

  if (!process.env.SENTIMENT_THRESHOLD) {
    throw new Error("SENTIMENT_THRESHOLD not found");
  }
  if (isNaN(Number(process.env.SENTIMENT_THRESHOLD))) {
    throw new Error("SENTIMENT_THRESHOLD is not a number");
  }

  // if (!process.env.ORDER_BOOK_DEPTH_THRESHOLD) {
  //   throw new Error('BITVAVO_URL not found');
  // }
  // if (isNaN(Number(process.env.ORDER_BOOK_DEPTH_THRESHOLD))) {
  //   throw new Error('ORDER_BOOK_DEPTH_THRESHOLD is not a number');
  // }

  if (!process.env.ORDER_BOOK_DEPTH) {
    throw new Error("ORDER_BOOK_DEPTH not found");
  }
  if (isNaN(Number(process.env.ORDER_BOOK_DEPTH))) {
    throw new Error("ORDER_BOOK_DEPTH is not a number");
  }

  if (!process.env.BUY_PRICE_LIMIT_ORDER_MARGIN) {
    throw new Error("BUY_PRICE_LIMIT_ORDER_MARGIN not found");
  }
  if (isNaN(Number(process.env.BUY_PRICE_LIMIT_ORDER_MARGIN))) {
    throw new Error("BUY_PRICE_LIMIT_ORDER_MARGIN is not a number");
  }

  if (!process.env.SELL_PRICE_LIMIT_ORDER_MARGIN) {
    throw new Error("SELL_PRICE_LIMIT_ORDER_MARGIN not found");
  }
  if (isNaN(Number(process.env.SELL_PRICE_LIMIT_ORDER_MARGIN))) {
    throw new Error("SELL_PRICE_LIMIT_ORDER_MARGIN is not a number");
  }

  // if (!process.env.PRICE_CHANGE_THRESHOLD_FOR_ANALYSIS) {
  //   throw new Error('PRICE_CHANGE_THRESHOLD_FOR_ANALYSIS not found');
  // }
  // if (isNaN(Number(process.env.PRICE_CHANGE_THRESHOLD_FOR_ANALYSIS))) {
  //   throw new Error('PRICE_CHANGE_THRESHOLD_FOR_ANALYSIS is not a number');
  // }

  if (!process.env.HOURS_TO_KEEP_REDIS_DATA) {
    throw new Error("HOURS_TO_KEEP_REDIS_DATA not found");
  }
  if (isNaN(Number(process.env.HOURS_TO_KEEP_REDIS_DATA))) {
    throw new Error("HOURS_TO_KEEP_REDIS_DATA is not a number");
  }

  if (!process.env.TRADE_CYCLE_INTERVAL) {
    throw new Error("TRADE_CYCLE_INTERVAL not found");
  }
  if (isNaN(Number(process.env.TRADE_CYCLE_INTERVAL))) {
    throw new Error("TRADE_CYCLE_INTERVAL is not a number");
  }

  // if (!process.env.TRADE_HOLD_DECISION_THRESHOLD) {
  //   throw new Error('TRADE_HOLD_DECISION_THRESHOLD not found');
  // }
  // if (isNaN(Number(process.env.TRADE_HOLD_DECISION_THRESHOLD))) {
  //   throw new Error('TRADE_HOLD_DECISION_THRESHOLD is not a number');
  // }
}
