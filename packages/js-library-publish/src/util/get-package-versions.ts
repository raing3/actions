import * as exec from '@actions/exec';

type LernaLsResult = {
    name: string;
    version: string;
    private: boolean;
    location: string;
}[];

export const getPackageVersions = async (packageContent: any, isLernaRepository: boolean): Promise<string[]> => {
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

        return [...new Set(parsed.map(item => `v${item.version}`))];
    } else if (packageContent?.version) {
        return [`v${packageContent.version}`];
    }

    return [];
};
