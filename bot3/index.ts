import { getTradeDecision } from "./tradeDecisionGet";

const start = async () => {
  const tradeDecision = await getTradeDecision();
  console.log(tradeDecision);
}

start();
