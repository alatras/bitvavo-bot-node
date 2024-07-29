type OrderBookEntry = [string, string];

export interface OrderBook {
    market: string;
    nonce: number;
    bids: OrderBookEntry[];
    asks: OrderBookEntry[];
}

export class OrderBookAnalyzer {
    constructor(
        private readonly depthThreshold: number = 1000,
        private readonly rsiPeriod: number = 14,
        private readonly macdFast: number = 12,
        private readonly macdSlow: number = 26,
        private readonly macdSignal: number = 9
    ) {}

    private safeParseFloat(value: string): number {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    }

    private calculateOrderBookPrice(orderBook: OrderBook): number {
        const bids = orderBook.bids.slice(0, this.depthThreshold);
        const asks = orderBook.asks.slice(0, this.depthThreshold);

        const totalBidVolume = bids.reduce((sum, entry) => sum + this.safeParseFloat(entry[1]), 0);
        const totalAskVolume = asks.reduce((sum, entry) => sum + this.safeParseFloat(entry[1]), 0);

        if (totalBidVolume === 0 || totalAskVolume === 0) {
            return 0;
        }

        const weightedBidPrice = bids.reduce((sum, entry) => 
            sum + this.safeParseFloat(entry[0]) * this.safeParseFloat(entry[1]), 0) / totalBidVolume;
        const weightedAskPrice = asks.reduce((sum, entry) => 
            sum + this.safeParseFloat(entry[0]) * this.safeParseFloat(entry[1]), 0) / totalAskVolume;

        return (weightedBidPrice + weightedAskPrice) / 2;
    }

    private calculateRSI(orderBook: OrderBook): number {
        const prices = orderBook.bids.concat(orderBook.asks)
            .map(entry => this.safeParseFloat(entry[0]))
            .filter(price => price > 0)
            .sort((a, b) => a - b);

        if (prices.length < this.rsiPeriod) {
            return 0;
        }

        const changes = prices.slice(1).map((price, index) => price - prices[index]);
        const gains = changes.filter(change => change > 0);
        const losses = changes.filter(change => change < 0).map(loss => -loss);

        const avgGain = gains.reduce((sum, gain) => sum + gain, 0) / this.rsiPeriod;
        const avgLoss = losses.reduce((sum, loss) => sum + loss, 0) / this.rsiPeriod;

        if (avgLoss === 0) {
            return 100;
        }

        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    private calculateMACD(orderBook: OrderBook): { macdLine: number; signalLine: number } {
        const prices = orderBook.bids.concat(orderBook.asks)
            .map(entry => this.safeParseFloat(entry[0]))
            .filter(price => price > 0)
            .sort((a, b) => a - b);

        if (prices.length < this.macdSlow) {
            return { macdLine: 0, signalLine: 0 };
        }

        const emaFast = this.calculateEMA(prices, this.macdFast);
        const emaSlow = this.calculateEMA(prices, this.macdSlow);

        const macdLine = emaFast - emaSlow;
        const signalLine = this.calculateEMA([macdLine], this.macdSignal);

        return { macdLine, signalLine };
    }

    private calculateEMA(prices: number[], period: number): number {
        if (prices.length === 0) {
            return 0;
        }
        const k = 2 / (period + 1);
        return prices.reduce((ema, price) => price * k + ema * (1 - k), prices[0]);
    }

    processOrderBook(orderBook: OrderBook): { price: number; rsi: number; macdHistogram: number } {
        const price = this.calculateOrderBookPrice(orderBook);
        const rsi = this.calculateRSI(orderBook);
        const { macdLine, signalLine } = this.calculateMACD(orderBook);
        const macdHistogram = macdLine - signalLine;

        return { price, rsi, macdHistogram };
    }
}

// Example usage remains the same