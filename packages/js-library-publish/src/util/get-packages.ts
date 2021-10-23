import * as exec from '@actions/exec';
import path from 'path';

export type Package = {
    name: string;
    version: string;
    private: boolean;
    location: string;
};

export const getPackages = async (packageContent: any, isLernaRepository: boolean): Promise<Package[]> => {
    if (isLernaRepository) {
        let output = '';

        // check if current commit is tagged with the same version in the package.json
        await exec.exec('lerna ls --json', [], {
            silent: true,
            listeners: {
                stdout: (data: Buffer): void => {
                    output += data.toString();
                }
            }
        });

        return JSON.parse(output);
    }

    if (packageContent?.name &&
        packageContent?.version) {
        return [
            {
                name: packageContent.name,
                version: packageContent.version,
                location: path.resolve('.'),
                'private': Boolean(packageContent.private)
            }
        ];
    }

    throw new Error('No packages found in repository.');
};
