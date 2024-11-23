import { RestEndpointMethodTypes } from "@octokit/rest";

export type Repo =
  RestEndpointMethodTypes["activity"]["listReposStarredByAuthenticatedUser"]["response"]["data"][number];

export interface ViewerData {
  viewer: {
    starredRepositories: { totalCount: number };
  };
}