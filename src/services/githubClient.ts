import { graphql } from "@octokit/graphql";
import { Octokit } from "@octokit/rest";
import { retry } from "@octokit/plugin-retry";
import { config } from "../config";

const OctokitWithRetry = Octokit.plugin(retry);

export const sourceGraphQLClient = graphql.defaults({
  headers: {
    authorization: `token ${config.sourceToken}`,
  },
});
export const sourceGithubClient = new OctokitWithRetry({
  auth: config.sourceToken,
  request: {
    request: { retries: config.maxRetries },
  },
});

export const targetGithubClient = new Octokit({ auth: config.targetToken });
