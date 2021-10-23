import * as exec from '@actions/exec';

export const publish = async (nodeAuthToken: string, isPrivate: boolean): Promise<void> => {
    // eslint-disable-next-line no-template-curly-in-string
    await exec.exec('npm config set //registry.npmjs.org/:_authToken ${NODE_AUTH_TOKEN}');
    await exec.exec(
        'npm publish',
        isPrivate ? [] : ['--access=public'],
        {
            env: {
                ...process.env,
                NODE_AUTH_TOKEN: nodeAuthToken
            }
        }
    );
};
