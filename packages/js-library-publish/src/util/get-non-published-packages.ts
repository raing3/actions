import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { PackageVersions } from './get-package-versions';

export const getNonPublishedPackages = async (versions: PackageVersions): Promise<string[]> => {
    const nonPublishedPackaged: string[] = [];
    const publishedPackages: string[] = [];
    const promises = Object.entries(versions).map(async ([packageName, version]) => {
        let output = '';
        let errorOutput = '';

        try {
            // check if current commit is tagged with the same version in the package.json
            await exec.exec(`npm view ${packageName} versions --json`, [], {
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

            const isPublished = output.indexOf(`"${version}"`) >= 0;

            if (isPublished) {
                publishedPackages.push(packageName);
            } else {
                nonPublishedPackaged.push(packageName);
            }
        } catch (error: any) {
            if (errorOutput.indexOf('E404') >= 0) {
                core.info(`${packageName} has never been published.`);
                nonPublishedPackaged.push(packageName);
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
        core.info(`The following packages have already been publish: ${publishedPackages.join(', ')}`);
    }

    if (nonPublishedPackaged.length > 0) {
        core.info(`The following packages have not yet been publish: ${nonPublishedPackaged.join(', ')}`);
    }

    return nonPublishedPackaged;
};
