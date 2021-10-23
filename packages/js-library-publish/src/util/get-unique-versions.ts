import { Package } from './get-packages';

export const getUniqueVersions = (packages: Package[]): string[] => {
    return [...new Set(packages.map(item => `v${item.version}`))];
};
