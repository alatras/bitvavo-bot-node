import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

interface ControlObject {
  name: string;
  guessRatio: number;
  control: Record<string, string>;
}

function isCredential(key: string): boolean {
  return /API(KEY|SECRET)|PASSWORD|TOKEN/i.test(key);
}

/**
 * Log the control object (from .env) to a file along with the guess ratio.
 * This is for tracking the performance of different control objects.
 * @param guessRatio The ratio of correct guesses
 */
function logControl(guessRatio: number): void {
  // Load environment variables from .env file
  const result = dotenv.config();

  if (result.error) {
    throw new Error("Error loading .env file");
  }

  const env = result.parsed || {};

  // Formulate a unique string name
  const uniqueName = Object.entries(env)
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
  const logFilePath = path.join(logDir, "control-history.log");

  // Read existing log file or create an empty array if it doesn't exist
  let existingLog: ControlObject[] = [];
  if (fs.existsSync(logFilePath)) {
    const fileContent = fs.readFileSync(logFilePath, "utf-8");
    existingLog = fileContent ? JSON.parse(fileContent) : [];
  }

  // Find and remove the existing object with the same name, if any
  const index = existingLog.findIndex((obj) => obj.name === uniqueName);
  if (index !== -1) {
    existingLog.splice(index, 1);
  }

  // Add the new control object
  existingLog.push(controlObject);

  // Write the updated log back to the file
  fs.writeFileSync(logFilePath, JSON.stringify(existingLog, null, 2));
}

export default logControl;
