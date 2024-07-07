import * as dotenv from 'dotenv';
dotenv.config();

export function readConfig() {
  if (!process.env.APIKEY) {
    throw new Error('APIKEY not found');
  }

  if (!process.env.APISECRET) {
    throw new Error('APISECRET not found');
  }

  if (!process.env.EUR_AMOUNT) {
    throw new Error('EUR_AMOUNT not found');
  }
  if (isNaN(Number(process.env.EUR_AMOUNT))) {
    throw new Error('EUR_AMOUNT is not a number');
  }

  if (!process.env.SENTIMENT_THRESHOLD) {
    throw new Error('SENTIMENT_THRESHOLD not found');
  }
  if (isNaN(Number(process.env.SENTIMENT_THRESHOLD))) {
    throw new Error('SENTIMENT_THRESHOLD is not a number');
  }

  if (!process.env.DEPTH_THRESHOLD) {
    throw new Error('BITVAVO_URL not found');
  }
  if (isNaN(Number(process.env.DEPTH_THRESHOLD))) {
    throw new Error('DEPTH_THRESHOLD is not a number');
  }

  if (!process.env.BUY_PRICE_LIMIT_ORDER_MARGIN) {
    throw new Error('BUY_PRICE_LIMIT_ORDER_MARGIN not found');
  }
  if (isNaN(Number(process.env.BUY_PRICE_LIMIT_ORDER_MARGIN))) {
    throw new Error('BUY_PRICE_LIMIT_ORDER_MARGIN is not a number');
  }

  if (!process.env.SELL_PRICE_LIMIT_ORDER_MARGIN) {
    throw new Error('SELL_PRICE_LIMIT_ORDER_MARGIN not found');
  }
  if (isNaN(Number(process.env.SELL_PRICE_LIMIT_ORDER_MARGIN))) {
    throw new Error('SELL_PRICE_LIMIT_ORDER_MARGIN is not a number');
  }
}