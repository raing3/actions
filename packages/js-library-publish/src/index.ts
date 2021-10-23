import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as github from '@actions/github';
import { createRelease, publish } from './task';
import {
    getMaxVersion,
    getNonPublishedPackages,
    getPackages,
    getUniqueVersions,
    headHasVersionTag
} from './util';
import { createPackageTarball } from './util/create-package-tarball';
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

    const packages = await getPackages(packageContent, isLernaRepository);
    const maxVersion = getMaxVersion(packages);
    const uniqueVersions = getUniqueVersions(packages);
    const isViableForRelease = await core.group('Check if commit is viable for release', async () => {
        // don't publish on failure or if commit hasn't been tagged
        if (!await headHasVersionTag(uniqueVersions)) {
            return false;
        }

        // don't publish if version already published
        const nonPublishedPackages = await getNonPublishedPackages(packages);

        return nonPublishedPackages.length > 0;
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

    // build packages
    const packageFiles = await Promise.all(packages.map(item => createPackageTarball(item.location)));

    // create github release
    if (config.githubToken) {
        await core.group('Create GitHub release', async () => {
            const client = github.getOctokit(config.githubToken);

            await createRelease(client as any as Octokit, maxVersion, packageFiles);
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
