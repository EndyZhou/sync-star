import { getStarredRepos, starRepos } from "./services/repoOperations";
import { logger } from "./utils/logger";
import { Repo } from "./types";

export async function migrateStars(): Promise<void> {
  try {
    logger.info("Starting GitHub star migration process using GraphQL...");

    const starredRepos: Repo[] = await getStarredRepos();
    logger.info(`Successfully fetched ${starredRepos.length} public starred repositories.`);
    await starRepos(starredRepos);

    logger.success("Star migration completed!");
  } catch (error) {
    logger.error(`An unexpected error occurred during star migration: ${error}`);
  }
}
