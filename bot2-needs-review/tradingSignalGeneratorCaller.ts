import { TradingSignalGenerator } from "./tradingSignalGenerator";
import { OrderBook } from "./orderBookAnalyzer";
import { getBooks } from "./get-book";
import { readConfig } from "../src/utils/read-config";

readConfig();

const run = async () => {
  const orderBook: OrderBook = await getBooks();
  const signalGenerator = new TradingSignalGenerator();
  const signal = signalGenerator.generateSignal(orderBook);
  console.log(signal);
};

run();