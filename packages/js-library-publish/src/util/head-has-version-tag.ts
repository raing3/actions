import * as core from '@actions/core';
import * as exec from '@actions/exec';

export const headHasVersionTag = async (versions: string[]): Promise<boolean> => {
    if (versions.length === 0) {
        core.warning('No version identified from packages.');
        return false;
    }

    let output = '';

    // check if current commit is tagged with the same version in the package.json
    await exec.exec('git tag -l --points-at HEAD', [], {
        listeners: {
            stdout: (data: Buffer): void => {
                output += data.toString();
            }
        }
    });

    const tags = output.split('\n').map(item => item.trim());
    const intersection = tags.filter(tag => versions.includes(tag));

    core.info(`Head has the following tags: ${tags.join(', ')}`);

    if (versions.length === 1) {
        core.info(`Package version is: ${versions.join(', ')}`);
    } else {
        core.info(`Package versions are: ${versions.join(', ')}`);
    }

    core.info(`Intersection: ${intersection.join(', ')}, result: ${intersection.length > 0}`);

    return intersection.length > 0;
};
