import { v4 as uuidv4 } from "uuid";
import { startMarketSentimentCycle } from "./market-sentiment-logic";
import logger from "./utils/logger";
import { readConfig } from "./utils/read-config";

readConfig();

function start() {
  const instanceId = uuidv4();
  logger.initialize(instanceId);
  logger.info("Starting application with instance ID:", instanceId);

  async function executeCycle() {
    try {
      logger.info("\n");
      logger.OK(
        `${new Date().toISOString()} ` +
          "------------------- run ---------------------"
      );
      await startMarketSentimentCycle("BTC-EUR", instanceId);
    } catch (error) {
      logger.error("Error operating trading bot.");
      console.error(error);
      throw new Error("Error operating trading bot");
    }
  }

  const cycleSeconds = Number(process.env.TRADE_CYCLE_INTERVAL);
  executeCycle(); // Execute immediately on start
  setInterval(executeCycle, cycleSeconds * 1000); // Continue executing every 30 seconds
}

start();