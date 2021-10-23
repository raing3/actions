import * as exec from '@actions/exec';

export const publish = async (nodeAuthToken: string, isPrivate: boolean, isLernaRepository: boolean): Promise<void> => {
    const options = {
        env: {
            ...process.env,
            NODE_AUTH_TOKEN: nodeAuthToken
        }
    };

    // eslint-disable-next-line no-template-curly-in-string
    await exec.exec('npm config set //registry.npmjs.org/:_authToken ${NODE_AUTH_TOKEN}');

    if (isLernaRepository) {
        await exec.exec('lerna publish from-git', [], options);
    } else {
        await exec.exec('npm publish', isPrivate ? [] : ['--access=public'], options);
    }
};
