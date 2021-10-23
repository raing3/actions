import * as github from '@actions/github';
import { Octokit } from '@octokit/rest';

export const isReleased = async (client: Octokit, tag: string): Promise<boolean> => {
    try {
        await client.rest.repos.getReleaseByTag({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            tag: tag
        });

        return true;
    } catch {
        return false;
    }
};
