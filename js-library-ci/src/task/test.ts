import * as exec from "@actions/exec";
import * as core from "@actions/core";

export const test = async (packageContent: any) => {
    if (packageContent?.scripts?.test) {
        await exec.exec('run test --silent');
    } else {
        core.info('No test script specified, skipping.');
    }
};