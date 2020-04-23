import stripAnsi from 'strip-ansi';
import * as core from '@actions/core';
import * as exec from '@actions/exec';

export const headHasTag = async (tag: string): Promise<boolean> => {
    const versionTag = stripAnsi(tag);
    let output = '';

    // check if current commit is tagged with the same version in the package.json
    await exec.exec(`git tag -l "${versionTag}" --points-at HEAD`, [], {
        listeners: {
            stdout: (data: Buffer): void => {
                output += data.toString();
            }
        }
    });

    const result = output.trim() === versionTag;

    core.info(`Checking if head has git tag: ${tag}, result: ${result}`);

    return result;
};
