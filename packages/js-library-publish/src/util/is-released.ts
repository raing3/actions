import * as github from '@actions/github';

export const isReleased = async (client: github.GitHub, tag: string): Promise<boolean> => {
    try {
        await client.repos.getReleaseByTag({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            tag: tag
        });

        return true;
    } catch {
        return false;
    }
};
