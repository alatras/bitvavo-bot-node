import { OrderBook, OrderBookAnalyzer } from "./orderBookAnalyzer";
import * as fs from 'fs';
import * as path from 'path';

const orderBookPath = path.join(__dirname, 'book.json');
const orderBookData = fs.readFileSync(orderBookPath, 'utf8');
const orderBook: OrderBook = JSON.parse(orderBookData);

const analyzer = new OrderBookAnalyzer();
const analysis = analyzer.analyzeOrderBook(orderBook);
console.log(analysis);