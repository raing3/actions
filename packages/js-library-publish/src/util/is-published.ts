import * as exec from '@actions/exec';
import * as core from '@actions/core';

export const isPublished = async (version: string): Promise<boolean> => {
    let output = '';

    // check if current commit is tagged with the same version in the package.json
    await exec.exec('npm show . versions --json', [], {
        listeners: {
            stdout: (data: Buffer): void => {
                output += data.toString();
            }
        }
    });

    const result = output.indexOf(`"${version}"`) >= 0;

    core.info(`Checking if version has already been published: ${version}, result: ${result}`);

    return result;
};
