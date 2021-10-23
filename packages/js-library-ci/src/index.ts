import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { build, lint, test } from './task';
import fs from 'fs';

const packageContent = JSON.parse(fs.readFileSync('./package.json').toString());

async function run(): Promise<void> {
    process.env.CI = 'true'; // eslint-disable-line id-length

    // install dependencies
    await core.group('Installing dependencies', async () => {
        await exec.exec('npm ci');
    });

    // build packages if lerna.json exists
    // packages may have dependencies on one another and cause lint/test issues if dependencies aren't built first
    if (fs.existsSync('learn.json')) {
        await core.group('Build dependencies', async () => {
            core.info('Lerna configuration found, configuration and building packages.');
            await exec.exec('node_modules/.bin/lerna bootstrap --ci');
            await build(packageContent);
        });
    }

    // lint
    await core.group('Lint', async () => {
        try {
            await lint(packageContent);
        } catch (error) {
            core.setFailed('Lint failed');
        }
    });

    // test
    await core.group('Test', async () => {
        try {
            await test(packageContent);
        } catch (error) {
            core.setFailed('Tests failed');
        }
    });
}

run().catch(error => {
    core.setFailed(error?.message);
});
