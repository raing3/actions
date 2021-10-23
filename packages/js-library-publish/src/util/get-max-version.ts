import compare from 'semver-compare';
import { Package } from './get-packages';

export const getMaxVersion = (packages: Package[]): string => {
    if (packages.length === 0) {
        throw new Error('No packages have been provided.');
    }

    const sorted = packages.map(item => item.version).sort(compare);

    return `v${sorted[sorted.length - 1]}`;
};
