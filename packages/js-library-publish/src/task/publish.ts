import * as exec from '@actions/exec';

export const publish = async (nodeAuthToken: string, packageFiles: string[]): Promise<void> => {
    // eslint-disable-next-line no-template-curly-in-string
    await exec.exec('npm config set //registry.npmjs.org/:_authToken ${NODE_AUTH_TOKEN}');

    await Promise.all(packageFiles.map(async packageFile => {
        await exec.exec(
            `npm publish "${packageFile}" --access=public`,
            [],
            {
                env: {
                    ...process.env,
                    NODE_AUTH_TOKEN: nodeAuthToken
                }
            }
        );
    }));
};
