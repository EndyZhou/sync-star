import dotenv from 'dotenv';

dotenv.config();

export const config = {
  sourceToken: process.env.SOURCE_GITHUB_TOKEN,
  targetToken: process.env.TARGET_GITHUB_TOKEN,
  perPage: 100,
  maxRetries: 10,
  retryDelay: 1000,
  logFile: 'github-star-migration.log',
  failedReposFile: 'failed-repos.csv',
  concurrency: 20,
  removeOriginalStars: true, // Option to control removal of original stars
};
