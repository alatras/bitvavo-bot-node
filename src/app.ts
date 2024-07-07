import { startMarketSentimentCycle } from './market-sentiment-logic';
import logger from './utils/logger';
import { readConfig } from './utils/read-config';

readConfig();

function start() {
  async function executeCycle() {
    try {
      logger.info('\n');
      logger.OK(`${new Date().toISOString()} ` + '------------------- run ---------------------');
      await startMarketSentimentCycle('BTC-EUR', Number(process.env.DEPTH_THRESHOLD));
    } catch (error) {
      logger.error('Error operating trading bot.');
      console.error(error);
      throw new Error('Error operating trading bot');
    }
  }

  executeCycle(); // Execute immediately on start
  setInterval(executeCycle, 30000); // Continue executing every 30 seconds
}

start();
