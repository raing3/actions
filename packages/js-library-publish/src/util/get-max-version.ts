import compare from 'semver-compare';

export const getMaxVersion = (versions: string[]): string => {
    if (versions.length === 0) {
        throw new Error('No versions have been provided.');
    }

    const sorted = versions.sort(compare);

    return sorted[sorted.length - 1];
};
