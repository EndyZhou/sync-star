import PQueue from "p-queue";
import { config } from "../config";
import { Repo, ViewerData } from "../types";
import { logger } from "../utils/logger";
import { sourceGraphQLClient, sourceGithubClient, targetGithubClient } from "./githubClient";
import { progressTracker } from "../utils/progressTracker";

const queue = new PQueue({ concurrency: config.concurrency, intervalCap: 1 });

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function checkUserPermissions() {
  const response = await targetGithubClient.users.getAuthenticated();
  return response.data;
}

async function getTotalStarredRepos(): Promise<number> {
  const query = `
      query($cursor: String) {
        viewer {
          starredRepositories(first: 1, after: $cursor) {
            totalCount
          }
        }
      }
    `;
  try {
    const res = await sourceGraphQLClient<ViewerData>(query);
    return res.viewer.starredRepositories.totalCount;
  } catch (error: any) {
    handleError(error, "GitHub API Error");
  }
}

async function fetchStarredReposPage(page: number) {
  try {
    const response = await sourceGithubClient.activity.listReposStarredByAuthenticatedUser({
      per_page: config.perPage,
      page: page,
    });
    if (response.status !== 200) {
      throw new Error(`Failed to fetch starred repositories. Status: ${response.status}`);
    }
    if (!Array.isArray(response.data)) {
      throw new Error("Failed to fetch starred repositories. Invalid response data.");
    }
    return response.data;
  } catch (error) {
    handleError(error, "GitHub API Error");
  }
}

function handleError(error: any, message: string): never {
  if (error instanceof Error) {
    logger.error(`${message}: ${error.message}`);
  } else {
    logger.error(`Unknown error occurred: ${message}`);
  }
  throw error;
}

export async function getStarredRepos(): Promise<Repo[]> {
  try {
    progressTracker.startSpinner("Fetching total starred repositories...");
    const totalStarredRepos = await getTotalStarredRepos();
    progressTracker.updateSpinner(`Found ${totalStarredRepos} starred repositories.`);

    if (totalStarredRepos === 0) {
      progressTracker.succeedSpinner("No starred repositories found.");
      return [];
    }

    progressTracker.updateSpinner("Fetching starred repositories...");
    const totalPages = Math.ceil(totalStarredRepos / config.perPage);
    const allRepos: Repo[] = [];

    for (let page = 1; page <= totalPages; page++) {
      queue.add(async () => {
        const pageRepos = await fetchStarredReposPage(page);
        allRepos.push(...pageRepos);
        progressTracker.updateSpinner(
          `Fetched ${allRepos.length}/${totalStarredRepos} starred repositories.`
        );
        await delay(config.retryDelay);
      });
    }

    await queue.onIdle();

    const publicRepos = allRepos.filter((repo) => !repo.private);
    progressTracker.succeedSpinner(`Successfully fetched ${publicRepos.length} public starred repositories.`);

    return publicRepos;
  } catch (error) {
    progressTracker.failSpinner("Error fetching starred repositories");
    handleError(error, "Failed to fetch starred repositories");
  }
}

export async function starRepos(repos: Repo[]): Promise<void> {
  const userInfo = await checkUserPermissions();
  logger.info(`Logged in as: ${userInfo.login}`);
  logger.info(`Total public repositories: ${userInfo.public_repos}`);

  progressTracker.initializeStats(repos.length);
  progressTracker.startSpinner(`Processing ${repos.length} repositories...`);

  for (const repo of repos) {
    queue.add(async () => {
      try {
        await targetGithubClient.activity.starRepoForAuthenticatedUser({
          owner: repo.owner.login,
          repo: repo.name,
        });
        logger.success(`Successfully starred repository: ${repo.full_name}`);

        if (config.removeOriginalStars) {
          await sourceGithubClient.activity.unstarRepoForAuthenticatedUser({
            owner: repo.owner.login,
            repo: repo.name,
          });
          logger.success(`Successfully removed star from repository: ${repo.full_name}`);
        }

        progressTracker.updateStats(true);
      } catch (error) {
        progressTracker.updateStats(false);
        logger.logFailedRepo(repo);
      }
      await delay(config.retryDelay);
    });
  }

  await queue.onIdle();
  const stats = progressTracker.getStats();
  progressTracker.succeedSpinner(
    `Finished processing repositories. ${stats.successfulMigrations}/${stats.totalRepos} successful.`
  );

  progressTracker.generateReport();
}
