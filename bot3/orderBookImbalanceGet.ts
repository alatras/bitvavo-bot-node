import { getBooks } from "./get-book";
import {
  calculateOrderBookImbalance,
  getOrderBookImbalanceWithContext,
} from "./orderBookImbalanceCalculator";

export const getOrderBookImbalance =
  async (): Promise<number> => {
    const bookData = await getBooks();
    const imbalance = calculateOrderBookImbalance(bookData);

    // ** All bellow is for logging purposes **
    const imbalanceContext = getOrderBookImbalanceWithContext(bookData);
    console.log(`Order Book Imbalance: ${imbalanceContext.imbalance}`);
    console.log(`Interpretation: ${imbalanceContext.interpretation}`);
    console.log(`Mid Price: ${imbalanceContext.midPrice}`);

    return imbalance;
  };
