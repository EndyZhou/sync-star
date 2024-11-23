import fs from 'fs';
import path from 'path';
import { config } from '../config';
import { Repo } from  "../types";

enum LogLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}

class Logger {
  private logFile: string;
  private failedReposFile: string;

  constructor(logFilename: string, failedReposFilename: string) {
    this.logFile = path.join(process.cwd(), logFilename);
    this.failedReposFile = path.join(process.cwd(), failedReposFilename);
  }

  private logMessage(level: LogLevel, message: string) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level}] ${message}\n`;

    let consoleMethod: 'log' | 'warn' | 'error';
    switch (level) {
      case LogLevel.WARNING:
        consoleMethod = 'warn';
        break;
      case LogLevel.ERROR:
        consoleMethod = 'error';
        break;
      default:
        consoleMethod = 'log';
    }

    // console[consoleMethod](formattedMessage.trim());
    fs.appendFileSync(this.logFile, formattedMessage);
  }

  info(message: string) {
    this.logMessage(LogLevel.INFO, message);
  }

  warning(message: string) {
    this.logMessage(LogLevel.WARNING, message);
  }

  error(message: string) {
    this.logMessage(LogLevel.ERROR, message);
  }

  success(message: string) {
    this.logMessage(LogLevel.SUCCESS, message);
  }

  logFailedRepo(repo: Repo) {
    const failedRepoInfo = `${repo.full_name},${repo.id}\n`;
    fs.appendFileSync(this.failedReposFile, failedRepoInfo);
  }
}

export const logger = new Logger(config.logFile, config.failedReposFile);
