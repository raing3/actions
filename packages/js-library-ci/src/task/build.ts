import * as core from '@actions/core';
import * as exec from '@actions/exec';

export const build = async (packageContent: any): Promise<void> => {
    if (packageContent?.scripts?.build) {
        try {
            await exec.exec('npm run build --silent');
        } catch (error) {
            core.setFailed('Build failed');
            throw error;
        }
    } else {
        core.info('No build script specified, skipping.');
    }
};
