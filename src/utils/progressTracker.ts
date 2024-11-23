import ora, { Ora } from "ora";
import fs from "fs";

export interface MigrationStats {
  totalRepos: number;
  successfulMigrations: number;
  failedMigrations: number;
  startTime: Date;
  endTime?: Date;
}

export class ProgressTracker {
  private stats: MigrationStats;
  private spinner: Ora | null = null;

  constructor() {
    this.stats = {
      totalRepos: 0,
      successfulMigrations: 0,
      failedMigrations: 0,
      startTime: new Date(),
    };
  }

  initializeStats(totalRepos: number) {
    this.stats.totalRepos = totalRepos;
  }

  updateStats(success: boolean) {
    if (success) {
      this.stats.successfulMigrations++;
    } else {
      this.stats.failedMigrations++;
    }
    this.updateSpinner();
  }

  getStats(): MigrationStats {
    return { ...this.stats };
  }

  startSpinner(text: string) {
    this.spinner = ora(text).start();
  }

  updateSpinner(text?: string) {
    if (this.spinner) {
      if (text) {
        this.spinner.text = text;
      } else {
        const { successfulMigrations, failedMigrations, totalRepos } = this.stats;
        const completed = successfulMigrations + failedMigrations;
        this.spinner.text = `Progress: ${completed}/${totalRepos} (${successfulMigrations} successful, ${failedMigrations} failed)`;
      }
    }
  }

  succeedSpinner(text: string) {
    if (this.spinner) {
      this.spinner.succeed(text);
    }
  }

  failSpinner(text: string) {
    if (this.spinner) {
      this.spinner.fail(text);
    }
  }

  generateReport() {
    this.stats.endTime = new Date();
    const duration = (this.stats.endTime.getTime() - this.stats.startTime.getTime()) / 1000;

    const report = `
Migration Report:
-----------------
Total repositories: ${this.stats.totalRepos}
Successfully migrated: ${this.stats.successfulMigrations}
Failed migrations: ${this.stats.failedMigrations}
Success rate: ${((this.stats.successfulMigrations / this.stats.totalRepos) * 100).toFixed(2)}%
Duration: ${duration.toFixed(2)} seconds
Start time: ${this.stats.startTime.toISOString()}
End time: ${this.stats.endTime.toISOString()}
    `;

    console.log(report);
  }
}

export const progressTracker = new ProgressTracker();
