import fs from "fs/promises";
import path from "path";
import { TradingSignalGenerator } from "./tradingSignalGenerator";
import { OrderBook } from "./orderBookAnalyzer";
import { getBooks } from "./get-book";
import { readConfig } from "../src/utils/read-config";
import { getTickerPrice } from "./get-ticker-price";

interface AnalysisResult {
  timestamp: string;
  signal: ReturnType<TradingSignalGenerator["generateSignal"]>;
  currentPrice: number;
}

interface ScoreEntry {
  timestamp: string;
  score: number;
}

class ScoreFinder {
  private analysisResults: AnalysisResult[] = [];
  private scores: ScoreEntry[] = [];
  private signalGenerator: TradingSignalGenerator;

  constructor(private intervalMinutes: number = 7) {
    this.signalGenerator = new TradingSignalGenerator();
    readConfig();
  }

  private async saveToFile(data: any, filename: string): Promise<void> {
    await fs.writeFile(filename, JSON.stringify(data, null, 2));
  }

  private async loadFromFile(filename: string): Promise<any> {
    try {
      const data = await fs.readFile(filename, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return {};
    }
  }

  private calculateScore(results: AnalysisResult[]): number {
    let correctPredictions = 0;
    for (let i = 0; i < results.length - 1; i++) {
      const currentResult = results[i];
      const nextResult = results[i + 1];
      if (
        (currentResult.signal.action === "BUY" &&
          nextResult.currentPrice > currentResult.currentPrice) ||
        (currentResult.signal.action === "SELL" &&
          nextResult.currentPrice < currentResult.currentPrice)
      ) {
        correctPredictions++;
      } else if (currentResult.signal.action !== "HOLD") {
        correctPredictions--;
      }
    }
    return results.length > 1 ? correctPredictions / (results.length - 1) : 0;
  }

  private logSignals(
    currentSignal: ReturnType<TradingSignalGenerator["generateSignal"]>
  ) {
    const previousResult =
      this.analysisResults[this.analysisResults.length - 2];
    if (previousResult) {
      console.log("Previous signal:");
      console.log(`  Action: ${previousResult.signal.action}`);
      console.log(
        `  Confidence: ${previousResult.signal.confidence.toFixed(4)}`
      );
      console.log(`  Reason: ${previousResult.signal.reason}`);
    } else {
      console.log("No previous signal available.");
    }

    console.log("Current signal:");
    console.log(`  Action: ${currentSignal.action}`);
    console.log(`  Confidence: ${currentSignal.confidence.toFixed(4)}`);
    console.log(`  Reason: ${currentSignal.reason}`);
  }

  async runAnalysis(): Promise<void> {
    const orderBook: OrderBook = await getBooks();
    const currentPrice: number = await getTickerPrice();
    const signal = this.signalGenerator.generateSignal(orderBook);
    const timestamp = new Date().toISOString();

    const result: AnalysisResult = { timestamp, signal, currentPrice };
    this.analysisResults.push(result);

    await this.saveToFile(this.analysisResults, "analysis_output.json");

    if (this.analysisResults.length > 1) {
      const score = this.calculateScore(this.analysisResults);
      const scoreEntry: ScoreEntry = { timestamp, score };
      this.scores.push(scoreEntry);

      const allScores = await this.loadFromFile("analysis_score.json");
      allScores[timestamp] = score;
      await this.saveToFile(allScores, "analysis_score.json");
    }

    console.log(`Analysis run at ${timestamp}`);
    console.log(`Current price: ${currentPrice}`);
    this.logSignals(signal);
    console.log(
      `Current score: ${
        this.scores[this.scores.length - 1]?.score.toFixed(2) || "N/A"
      }`
    );
    console.log("----------------------------------------");
  }

  async start(): Promise<void> {
    console.log(
      `Starting analysis at ${this.intervalMinutes} minute intervals`
    );
    await this.runAnalysis(); // Run immediately
    setInterval(() => this.runAnalysis(), this.intervalMinutes * 60 * 1000);
  }
}

// Usage
const scoreFinder = new ScoreFinder();
scoreFinder.start();
