import path from 'path';

export default {

    // resolves from test to snapshot path
    resolveSnapshotPath: (testFilePath: string, snapshotExtension: string) => {
        const pwd = path.resolve('./');
        testFilePath = path.resolve(testFilePath).substring(pwd.length + 1);

        return path.resolve(path.join('test/snapshots', testFilePath + snapshotExtension));
    },

    // resolves from snapshot to test path
    resolveTestPath: (snapshotFilePath: string, snapshotExtension: string) => {
        const pwd = path.resolve('./');
        snapshotFilePath = path.resolve(snapshotFilePath)
            .substring(pwd.length + '/test/snapshots/'.length)
            .slice(0, -snapshotExtension.length);

        return snapshotFilePath;
    },

    // Example test path, used for preflight consistency check of the implementation above
    testPathForConsistencyCheck: 'some/unit.test.js',

};