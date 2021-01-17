import * as exec from '@actions/exec';
import * as core from '@actions/core';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const test = async (packageContent: any): Promise<void> => {
    if (packageContent?.scripts?.test) {
        await exec.exec('npm test --silent');
    } else {
        core.info('No test script specified, skipping.');
    }
};
