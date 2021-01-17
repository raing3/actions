import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as github from '@actions/github';
import fs from 'fs';
import { headHasTag, isPublished } from './util';
import { createRelease, publish } from './task';
import { Octokit } from '@octokit/rest';

const packageContent = JSON.parse(fs.readFileSync('./package.json').toString());
const config = {
    githubToken: core.getInput('github_token'),
    npmToken: core.getInput('npm_token'),
    action: core.getInput('action')
};

async function run(): Promise<void> {
    process.env.CI = 'true'; // eslint-disable-line id-length

    const isViableForRelease = await core.group('Check if commit is viable for release', async () => {
        // don't publish on failure or if commit hasn't been tagged
        if (!await headHasTag(`v${packageContent.version}`)) {
            return false;
        }

        // don't publish if version already published
        if (await isPublished(packageContent.version)) {
            core.info(`Version ${packageContent.version} has already been published, not publishing.`);
            return false;
        }

        return true;
    });

    if (!isViableForRelease) {
        return;
    }

    // install dependencies
    await core.group('Installing dependencies', async () => {
        await exec.exec('npm ci');
    });

    // create github release
    if (config.githubToken) {
        await core.group('Create GitHub release', async () => {
            const client = github.getOctokit(config.githubToken);

            await createRelease(client as any as Octokit, packageContent.version);
        });
    }

    // publish to npm
    if (config.npmToken) {
        await core.group('Publish to NPM', async () => {
            await publish(config.npmToken);
        });
    }
}

run().catch(error => {
    core.setFailed(error?.message);
});
