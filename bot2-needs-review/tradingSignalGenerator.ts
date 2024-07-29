import { OrderBook, OrderBookAnalyzer } from "./orderBookAnalyzer";

interface TradingSignal {
    action: 'BUY' | 'SELL' | 'HOLD';
    confidence: number; // 0 to 1
    reason: string;
}

export class TradingSignalGenerator {
    private analyzer: OrderBookAnalyzer;

    constructor(
        private readonly imbalanceThreshold: number = 0.05,
        private readonly liquidityThreshold: number = 1000,
        private readonly spreadThreshold: number = 10,
        private readonly vwapWeight: number = 0.3,
        private readonly depthImbalanceThreshold: number = 0.2
    ) {
        this.analyzer = new OrderBookAnalyzer();
    }

    private safeParseFloat(value: string): number {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    }

    generateSignal(orderBook: OrderBook): TradingSignal {
        const analysis = this.analyzer.analyzeOrderBook(orderBook);

        console.log('Analysis of analyzer.analyzeOrderBook:', analysis);

        let signal: TradingSignal = { action: 'HOLD', confidence: 0, reason: '' };

        // Check order book imbalance
        if (Math.abs(analysis.orderBookImbalance) > this.imbalanceThreshold) {
            signal.action = analysis.orderBookImbalance > 0 ? 'BUY' : 'SELL';
            signal.confidence = Math.min(Math.abs(analysis.orderBookImbalance), 1);
            signal.reason += `Order book imbalance of ${(analysis.orderBookImbalance * 100).toFixed(2)}% suggests ${signal.action} pressure. `;
        }

        // Check market depth imbalance
        const depthImbalance = (analysis.marketDepth.bids - analysis.marketDepth.asks) / (analysis.marketDepth.bids + analysis.marketDepth.asks);
        if (Math.abs(depthImbalance) > this.depthImbalanceThreshold) {
            const depthAction = depthImbalance > 0 ? 'BUY' : 'SELL';
            const depthConfidence = Math.min(Math.abs(depthImbalance), 1) * 0.5;  // Weight of 0.5
            if (signal.action === 'HOLD' || depthConfidence > signal.confidence) {
                signal.action = depthAction;
                signal.confidence = depthConfidence;
            }
            signal.reason += `Market depth imbalance of ${(depthImbalance * 100).toFixed(2)}% suggests ${depthAction} pressure. `;
        }

        // Check liquidity
        if (analysis.liquidity < this.liquidityThreshold) {
            signal.confidence *= 0.8; // Reduce confidence in illiquid markets
            signal.reason += `Low liquidity detected (${analysis.liquidity.toFixed(2)}). `;
        }

        // Check spread
        if (analysis.bidAskSpread > this.spreadThreshold) {
            signal.confidence *= 0.9; // Reduce confidence with wide spreads
            signal.reason += `Wide bid-ask spread observed (${analysis.bidAskSpread.toFixed(2)}). `;
        }

        // Use VWAP for additional context
        const currentPrice = (this.safeParseFloat(orderBook.bids[0][0]) + this.safeParseFloat(orderBook.asks[0][0])) / 2;
        const vwapDifference = (analysis.vwap - currentPrice) / analysis.vwap;
        
        if (Math.abs(vwapDifference) > 0.001) { // 0.1% threshold
            const vwapConfidence = Math.min(Math.abs(vwapDifference) * 10, 1) * this.vwapWeight;
            if (currentPrice < analysis.vwap) {
                signal.reason += `Price ${(vwapDifference * 100).toFixed(2)}% below VWAP. `;
                if (signal.action === 'HOLD' || (signal.action === 'BUY' && signal.confidence < vwapConfidence)) {
                    signal.action = 'BUY';
                    signal.confidence = Math.max(signal.confidence, vwapConfidence);
                }
            } else {
                signal.reason += `Price ${(-vwapDifference * 100).toFixed(2)}% above VWAP. `;
                if (signal.action === 'HOLD' || (signal.action === 'SELL' && signal.confidence < vwapConfidence)) {
                    signal.action = 'SELL';
                    signal.confidence = Math.max(signal.confidence, vwapConfidence);
                }
            }
        }

        // If confidence is still 0, set action to HOLD
        if (signal.confidence === 0) {
            signal.action = 'HOLD';
            signal.reason = signal.reason || 'No significant signals detected.';
        }

        return signal;
    }
}
