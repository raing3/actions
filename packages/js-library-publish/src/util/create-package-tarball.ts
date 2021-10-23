import * as exec from '@actions/exec';
import path from 'path';

export const createPackageTarball = async (directory: string): Promise<string> => {
    let output = '';

    directory = path.resolve(directory);

    await exec.exec('npm pack', [], {
        cwd: directory,
        listeners: {
            stdout: (data: Buffer): void => {
                output += data.toString();
            }
        }
    });
    output = output.trim();

    const fileName = output.substr(output.lastIndexOf('\n') + 1);

    return path.resolve(directory, fileName);
};
