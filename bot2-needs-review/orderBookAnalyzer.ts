type OrderBookEntry = [string, string];

export interface OrderBook {
    market: string;
    nonce: number;
    bids: OrderBookEntry[];
    asks: OrderBookEntry[];
}

export class OrderBookAnalyzer {
    constructor(private readonly depthThreshold: number = 1000) {}

    private safeParseFloat(value: string): number {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    }

    calculateBidAskSpread(orderBook: OrderBook): number {
        if (orderBook.asks.length === 0 || orderBook.bids.length === 0) {
            return 0;
        }
        const bestBid = this.safeParseFloat(orderBook.bids[0][0]);
        const bestAsk = this.safeParseFloat(orderBook.asks[0][0]);
        return bestAsk - bestBid;
    }

    calculateOrderBookImbalance(orderBook: OrderBook): number {
        const bids = orderBook.bids.slice(0, this.depthThreshold);
        const asks = orderBook.asks.slice(0, this.depthThreshold);

        const bidVolume = bids.reduce((sum, [_, amount]) => sum + this.safeParseFloat(amount), 0);
        const askVolume = asks.reduce((sum, [_, amount]) => sum + this.safeParseFloat(amount), 0);

        return (bidVolume - askVolume) / (bidVolume + askVolume);
    }

    calculateMarketDepth(orderBook: OrderBook, levels: number = 5): { bids: number, asks: number } {
        const bids = orderBook.bids.slice(0, levels);
        const asks = orderBook.asks.slice(0, levels);

        const bidDepth = bids.reduce((sum, [_, amount]) => sum + this.safeParseFloat(amount), 0);
        const askDepth = asks.reduce((sum, [_, amount]) => sum + this.safeParseFloat(amount), 0);

        return { bids: bidDepth, asks: askDepth };
    }

    calculateLiquidity(orderBook: OrderBook, orderSize: number): number {
        let remainingSize = orderSize;
        let totalCost = 0;

        for (const [price, amount] of orderBook.asks) {
            const availableAmount = Math.min(remainingSize, this.safeParseFloat(amount));
            totalCost += availableAmount * this.safeParseFloat(price);
            remainingSize -= availableAmount;

            if (remainingSize <= 0) break;
        }

        return totalCost / orderSize;
    }

    calculateVWAP(orderBook: OrderBook): number {
        const asks = orderBook.asks.slice(0, this.depthThreshold);
        let totalVolume = 0;
        let sumPriceVolume = 0;

        for (const [price, amount] of asks) {
            const volume = this.safeParseFloat(amount);
            totalVolume += volume;
            sumPriceVolume += this.safeParseFloat(price) * volume;
        }

        return sumPriceVolume / totalVolume;
    }

    analyzeOrderBook(orderBook: OrderBook, orderSize: number = 1): {
        bidAskSpread: number;
        orderBookImbalance: number;
        marketDepth: { bids: number; asks: number };
        liquidity: number;
        vwap: number;
    } {
        return {
            bidAskSpread: this.calculateBidAskSpread(orderBook),
            orderBookImbalance: this.calculateOrderBookImbalance(orderBook),
            marketDepth: this.calculateMarketDepth(orderBook),
            liquidity: this.calculateLiquidity(orderBook, orderSize),
            vwap: this.calculateVWAP(orderBook)
        };
    }
}
