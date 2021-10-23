import * as core from '@actions/core';
import * as github from '@actions/github';
import fs from 'fs';
import { isReleased } from '../util';
import { Octokit } from '@octokit/rest';

export const createRelease = async (client: Octokit, version: string, packageFiles: string[]): Promise<void> => {
    if (await isReleased(client, version)) {
        core.info(`GitHub release for version ${version} already exists, skipping creation.`);
        return;
    }

    const release = await client.rest.repos.createRelease({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        tag_name: version, // eslint-disable-line @typescript-eslint/naming-convention
        name: `Release ${version}`
    });

    await Promise.all(packageFiles.map(async packageFile => {
        await client.rest.repos.uploadReleaseAsset({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            release_id: release.data.id, // eslint-disable-line @typescript-eslint/naming-convention
            name: packageFile,
            data: fs.readFileSync(packageFile, 'utf8')
        });
    }));
};
