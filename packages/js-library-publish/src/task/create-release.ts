import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as github from '@actions/github';
import fs from 'fs';
import { isReleased } from '../util';
import { Octokit } from '@octokit/rest';

export const createRelease = async (client: Octokit, version: string): Promise<void> => {
    let output = '';

    if (await isReleased(client, version)) {
        core.info(`GitHub release for version ${version} already exists, skipping creation.`);
        return;
    }

    await exec.exec('npm pack', [], {
        listeners: {
            stdout: (data: Buffer): void => {
                output += data.toString();
            }
        }
    });

    output = output.trim();

    const fileName = output.substr(output.lastIndexOf('\n') + 1);

    const release = await client.rest.repos.createRelease({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        tag_name: version, // eslint-disable-line @typescript-eslint/naming-convention
        name: `Release ${version}`
    });

    await client.rest.repos.uploadReleaseAsset({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        release_id: release.data.id, // eslint-disable-line @typescript-eslint/naming-convention
        name: fileName,
        data: fs.readFileSync(fileName, 'utf8')
    });
};
