import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as github from '@actions/github';
import { createRelease, publish } from './task';
import {
    getMaxVersion,
    getPackages,
    getPackagesToPublish,
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
    const uniqueVersions = getUniqueVersions(packages);
    const packagesToPublish = await core.group('Check if commit is viable for release', async () => {
        // don't publish on failure or if commit hasn't been tagged
        if (!await headHasVersionTag(uniqueVersions)) {
            return [];
        }

        // don't publish if version already published
        const result = await getPackagesToPublish(packages);

        if (result.length <= 0) {
            core.info(
                `To publish a new version run: ${isLernaRepository ? 'lerna' : 'npm'} version <patch|minor|major> ` +
                'and push the tag.'
            );
        }

        return result;
    });

    if (packagesToPublish.length <= 0) {
        return;
    }

    const maxVersion = getMaxVersion(packagesToPublish);

    // install dependencies
    await core.group('Installing dependencies', async () => {
        await exec.exec('npm ci');
    });

    // build all packages, there may be dependencies on packages which aren't being published
    const packageFilesToPublish: string[] = [];

    await core.group('Building packages', async () => {
        for (const item of packages) {
            const packageFile = await createPackageTarball(item.location);

            if (packagesToPublish.indexOf(item) >= 0) {
                packageFilesToPublish.push(packageFile);
            }
        }
    });

    // create github release
    await core.group('Create GitHub release', async () => {
        if (config.githubToken) {
            const client = github.getOctokit(config.githubToken);

            await createRelease(client as any as Octokit, maxVersion, packageFilesToPublish);
        } else {
            core.warning('GitHub token not provided, not creating GitHub release page.');
        }
    });

    // publish to npm
    await core.group('Publish to NPM', async () => {
        if (config.npmToken) {
            await publish(config.npmToken, packageFilesToPublish);
        } else {
            core.warning('NPM token not provided, not publishing to npmjs.com.');
        }
    });
}

run().catch(error => {
    core.setFailed(error?.message);
});
