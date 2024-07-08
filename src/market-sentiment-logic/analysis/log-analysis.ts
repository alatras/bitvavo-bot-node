import fs from 'fs';
import path from 'path';

/**
 * Log the analysis to a file
 * @param analysis The analysis to log
*/
export async function logAnalysis(analysis: string): Promise<void> {
  const logPath = path.join('./log', 'analysis.log');
  fs.appendFileSync(logPath, analysis + '\n\n');
}