import * as github from "@actions/github";
import { GitHub } from "@actions/github";

export const isReleased = async (client: GitHub, tag: string) => {
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