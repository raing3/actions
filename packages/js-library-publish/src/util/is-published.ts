import * as core from '@actions/core';
import * as exec from '@actions/exec';
import fs from 'fs';

export const isPublished = async (version: string): Promise<boolean> => {
    let output = '';
    let errorOutput = '';

    try {
        // check if current commit is tagged with the same version in the package.json
        await exec.exec('npm show . versions --json', [], {
            errStream: fs.createWriteStream('/dev/null'), // avoid showing E404 errors in the output
            listeners: {
                stdout: (data: Buffer): void => {
                    output += data.toString();
                },
                stderr: (data: Buffer): void => {
                    errorOutput += data.toString();
                }
            }
        });

        const result = output.indexOf(`"${version}"`) >= 0;

        core.info(`Checking if version has already been published: ${version}, result: ${result}`);

        return result;
    } catch (error: any) {
        if (errorOutput.indexOf('E404') >= 0) {
            core.info('This package has never been published.');
            return false;
        }

        if (errorOutput) {
            throw new Error(errorOutput);
        }

        throw error;
    }
};
