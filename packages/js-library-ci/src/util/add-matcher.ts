import path from 'path';

export const addMatcher = (fileName: string): void => {
    // path is relative to the "dist" folder.
    const matchersPath = path.join(__dirname, '..', 'src', 'matcher');

    console.log(`##[add-matcher]${path.join(matchersPath, fileName)}`); // eslint-disable-line no-console
};
