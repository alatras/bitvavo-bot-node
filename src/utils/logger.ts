import fs from 'fs';
import path from 'path';
import util from 'util';
import colors from 'colors/safe';

enum LogLevel {
  INFO = 'INFO',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  OK = 'OK',
}

class Logger {
  private logDir: string;

  constructor() {
    this.logDir = path.join(process.cwd(), 'log');
    this.ensureLogDirectoryExists();
  }

  private ensureLogDirectoryExists(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir);
    }
  }

  private formatMessage(args: any[]): string {
    return util.format(...args);
  }

  private logToFile(level: LogLevel, args: any[]): void {
    const message = this.formatMessage(args);
    const logEntry = `[${level}] ${message}\n`;
    const logFile = path.join(this.logDir, 'app.log');

    fs.appendFileSync(logFile, logEntry);
  }

  private logToConsole(level: LogLevel, args: any[]): void {
    const message = this.formatMessage(args);
    let coloredMessage: string;

    switch (level) {
      case LogLevel.INFO:
        console.log(...args);
        break;
      case LogLevel.OK:
        coloredMessage = colors.green(message);
        console.log(coloredMessage);
        break;
      case LogLevel.ERROR:
        coloredMessage = colors.red(message);
        console.log(`[${level}]`, coloredMessage);

        break;
      case LogLevel.WARNING:
        coloredMessage = colors.yellow(message);
        console.log(`[${level}]`, coloredMessage);

        break;
    }
  }

  public info(...args: any[]): void {
    this.logToFile(LogLevel.INFO, args);
    this.logToConsole(LogLevel.INFO, args);
  }

  public error(...args: any[]): void {
    this.logToFile(LogLevel.ERROR, args);
    this.logToConsole(LogLevel.ERROR, args);
  }

  public warning(...args: any[]): void {
    this.logToFile(LogLevel.WARNING, args);
    this.logToConsole(LogLevel.WARNING, args);
  }

  public OK(...args: any[]): void {
    this.logToFile(LogLevel.OK, args);
    this.logToConsole(LogLevel.OK, args);
  }
}

export default new Logger();