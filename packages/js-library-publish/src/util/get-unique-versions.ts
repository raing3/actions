export const getUniqueVersions = (versions: string[]): string[] => {
    return [...new Set(versions)];
};
