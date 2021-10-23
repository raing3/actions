import * as core from '@actions/core';
import * as exec from '@actions/exec';

export const test = async (packageContent: any): Promise<void> => {
    if (packageContent?.scripts?.test) {
        await exec.exec('npm test --silent');
    } else {
        core.info('No test script specified, skipping.');
    }
};
