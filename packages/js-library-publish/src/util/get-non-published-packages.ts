import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { Package } from './get-packages';

export const getNonPublishedPackages = async (packages: Package[]): Promise<Package[]> => {
    const nonPublishedPackaged: Package[] = [];
    const publishedPackages: Package[] = [];
    const promises = packages.map(async item => {
        let output = '';
        let errorOutput = '';

        try {
            // check if current commit is tagged with the same version in the package.json
            await exec.exec(`npm view ${item.name} versions --json`, [], {
                silent: true,
                listeners: {
                    stdout: (data: Buffer): void => {
                        output += data.toString();
                    },
                    stderr: (data: Buffer): void => {
                        errorOutput += data.toString();
                    }
                }
            });

            const isPublished = output.indexOf(`"v${item.version}"`) >= 0;

            if (isPublished) {
                publishedPackages.push(item);
            } else {
                nonPublishedPackaged.push(item);
            }
        } catch (error: any) {
            if (errorOutput.indexOf('E404') >= 0) {
                core.info(`${item.name} has never been published.`);
                nonPublishedPackaged.push(item);
                return;
            }

            if (errorOutput) {
                throw new Error(errorOutput);
            }

            throw error;
        }
    });

    await Promise.all(promises);

    if (publishedPackages.length > 0) {
        core.info(`${publishedPackages.map(item => item.name).join(', ')} has already been published.`);
    }

    if (nonPublishedPackaged.length > 0) {
        core.info(`${nonPublishedPackaged.join(', ')} has not been published yet.`);
    }

    return nonPublishedPackaged;
};
