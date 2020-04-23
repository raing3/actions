import * as exec from '@actions/exec';
import * as core from '@actions/core';

export const lint = async (packageContent: any): Promise<void> => {
    if (packageContent?.scripts?.lint) {
        try {
            await exec.exec('npm run lint --silent');
        } catch (error) {
            core.setFailed('Lint failed');
            throw error;
        }
    } else {
        core.info('No lint script specified, skipping.');
    }
};
