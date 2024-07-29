import { OrderBook, OrderBookAnalyzer } from "./indicators";
import * as fs from 'fs';
import * as path from 'path';

const orderBookPath = path.join(__dirname, 'book.json');
const orderBookData = fs.readFileSync(orderBookPath, 'utf8');
const orderBook: OrderBook = JSON.parse(orderBookData);

const analyzer = new OrderBookAnalyzer();
const result = analyzer.processOrderBook(orderBook);

console.log(
  `Price: ${result.price}, RSI: ${result.rsi}, MACD Histogram: ${result.macdHistogram}`
);