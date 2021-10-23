import * as exec from '@actions/exec';

type LernaLsResult = {
    name: string;
    version: string;
    private: boolean;
    location: string;
}[];

export type PackageVersions = {
    [name: string]: string;
};

export const getPackageVersions = async (packageContent: any, isLernaRepository: boolean): Promise<PackageVersions> => {
    if (isLernaRepository) {
        let output = '';

        // check if current commit is tagged with the same version in the package.json
        await exec.exec('lerna ls --json', [], {
            listeners: {
                stdout: (data: Buffer): void => {
                    output += data.toString();
                }
            }
        });

        const parsed: LernaLsResult = JSON.parse(output);
        const versions: PackageVersions = {};

        parsed.forEach(item => {
            versions[item.name] = `v${item.version}`;
        });
    } else if (packageContent?.name && packageContent?.version) {
        return { [packageContent.name]: `v${packageContent.version}` };
    }

    return {};
};
