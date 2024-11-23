# GitHub Star Migration Tool

This tool allows you to migrate your starred repositories from one GitHub account to another, with the option to remove stars from the original account after migration. It uses the GitHub REST API for all operations.

## Features

- Fetches all starred repositories from the source account using GitHub REST API (via @octokit/rest)
- Stars repositories in the target account
- Optionally removes stars from the source account after successful migration
- Filters out private repositories
- Implements retry mechanisms for API calls
- Provides detailed logging and progress updates
- Generates a comprehensive migration report

## Prerequisites

- Node.js (v18 or later)

## Installation

1. Clone this repository:

The script will:
1. Authenticate with the GitHub API
2. Fetch starred repositories from the source account
3. Migrate stars to the target account
4. Log progress updates during the process
5. Optionally remove stars from the source account
6. Generate a migration report

# See also
- [GitHub API documentation](https://docs.github.com/en/rest)
- [GitHub Tokens](https://github.com/settings/tokens/)