import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as github from '@actions/github';
import { createRelease, publish } from './task';
import { getPackageVersions, headHasVersionTag, isPublished } from './util';
import fs from 'fs';
import { Octokit } from '@octokit/rest';

const packageContent = JSON.parse(fs.readFileSync('./package.json').toString());
const isLernaRepository = fs.existsSync('./lerna.json');
const config = {
    githubToken: core.getInput('github_token'),
    npmToken: core.getInput('npm_token'),
    action: core.getInput('action')
};

async function run(): Promise<void> {
    process.env.CI = 'true'; // eslint-disable-line id-length

    const isViableForRelease = await core.group('Check if commit is viable for release', async () => {
        // don't publish on failure or if commit hasn't been tagged
        if (!await headHasVersionTag(await getPackageVersions(packageContent, isLernaRepository))) {
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
        core.info(
            `To publish a new version run: ${isLernaRepository ? 'lerna' : 'npm'} version <patch|minor|major> ` +
            'and push the tag.'
        );
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
    } else {
        core.warning('GitHub token not provided, not creating GitHub release page.');
    }

    // publish to npm
    if (config.npmToken) {
        await core.group('Publish to NPM', async () => {
            await publish(config.npmToken, Boolean(packageContent.private), isLernaRepository);
        });
    } else {
        core.warning('NPM token not provided, not publishing to npmjs.com.');
    }
}

run().catch(error => {
    core.setFailed(error?.message);
});
