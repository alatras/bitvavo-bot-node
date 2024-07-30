import * as fs from "fs";
import * as path from "path";
import dotenv, { DotenvParseOutput } from "dotenv";

/**
 * A control object to be logged to a file.
 */
interface ControlObject {
  name: string;
  guessRatio: number;
  checks: number;
  startDate: string;
  endDate: string;
  control: Record<string, string>;
}

/**
 * Check if a key is a credential-related variable.
 * @param key The key to check
 * @returns True if the key is a credential-related variable, false otherwise
 */
function isCredential(key: string): boolean {
  return /API(KEY|SECRET)|PASSWORD|TOKEN/i.test(key);
}

/**
 * Format a date object into a string.
 * @param date The date object to format
 * @returns A string representation of the date. Example: "15 January 2022, 12:34"
 */
function formatDate(date: Date): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

let EVN_OF_A_SINGLE_RUN: any;

const getSnapshotFromEnv = (): DotenvParseOutput => {
  if (EVN_OF_A_SINGLE_RUN) {
    return EVN_OF_A_SINGLE_RUN;
  }

  const file = process.env.ENV_FILE_NAME;

  // Load environment variables from .env file
  const result = dotenv.config(file ? { path: file } : {});
  if (result.error) {
    throw new Error("Error loading .env file");
  }
  const env = result.parsed || {};
  EVN_OF_A_SINGLE_RUN = env;
  return env;
};

/**
 * Log the control object (from .env) to a file along with the guess ratio.
 * This is for tracking the performance of different control objects.
 * @param guessRatio The ratio of correct guesses
 */
function logControl(
  guessRatio: number,
  instanceId: string
): void {
  const env = getSnapshotFromEnv();

  // Formulate a unique string name
  let uniqueName = Object.entries(env)
    .filter(([key, value]) => {
      const isValidNumber = value !== undefined && !isNaN(Number(value));
      return !isCredential(key) && isValidNumber;
    })
    .map(([, value]) => value)
    .join("");

  // Create the control object, excluding credential-related variables
  const controlObject: ControlObject = {
    name: uniqueName,
    guessRatio,
    checks: 1,
    startDate: formatDate(new Date()),
    endDate: formatDate(new Date()),
    control: Object.entries(env).reduce((acc, [key, value]) => {
      if (!isCredential(key)) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>),
  };

  // Ensure the log directory exists
  const logDir = path.join(".", "log");
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // Path to the log file
  const logFilePath = path.join(logDir, `control-history-${instanceId}.json`);

  // Read existing log file or create an empty array if it doesn't exist
  let existingLog: ControlObject[] = [];
  if (fs.existsSync(logFilePath)) {
    const fileContent = fs.readFileSync(logFilePath, "utf-8");
    existingLog = fileContent ? JSON.parse(fileContent) : [];
  }

  // Find the existing object with the same name, if any
  const index = existingLog.findIndex((obj) => obj.name === uniqueName);
  if (index !== -1) {
    // If the object exists, increment the checks
    if (existingLog[index].checks !== undefined) {
      existingLog[index].checks += 1;
    } else {
      // If 'checks' doesn't exist in an already-existing entry, add it starting from 1
      existingLog[index].checks = 1;
    }
    // Update other fields
    existingLog[index].guessRatio = guessRatio;
    existingLog[index].control = controlObject.control;
    existingLog[index].endDate = formatDate(new Date()); // Update the end date
  } else {
    // If it's a new control object, add it to the log
    existingLog.push(controlObject);
  }

  // Write the updated log back to the file
  fs.writeFileSync(logFilePath, JSON.stringify(existingLog, null, 2));
}

export default logControl;
