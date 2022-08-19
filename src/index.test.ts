import path from 'path';
import {Plugin, rollup, RollupOptions} from 'rollup';
import imageOptimize from "./index";
import {Format} from "./types";

const TEST_FIXTURES = {
    SIMPLE_BUILD: 'test/fixtures/simple-build/rollup-entry.js',
}

jest.setTimeout(100000000);

function rollupConfig (input: string, ...plugins: Plugin[]) : RollupOptions {
    return {
        input,
        plugins,
    };
}

describe('rollup plugin', () => {

    describe('integration with rollup', () => {
        it('should emit assets by default config', async () => {
            const build = await rollup(rollupConfig(TEST_FIXTURES.SIMPLE_BUILD, imageOptimize()));

            const {output} = await build.generate({
                name: 'test-bundle',
                dir: 'test/builds',
            });

            const [bundle, jpgAsset, webpAsset] = output;
            expect(bundle.code).toMatchSnapshot();

            expect(path.basename(jpgAsset.name || '')).toBe('asset.jpg');
            expect(path.basename(webpAsset.name || '')).toBe('asset.webp');
        });
    });

    describe('unit', () => {

        it('should throw an error when no formats are defined as `defaultFormatOptions`', async () => {
            const error = jest.fn();

            // @ts-ignore intentionally mocking PluginContext
            await imageOptimize({defaultFormatOptions: []}).load.call({error}, 'foo.png');

            expect(error).toBeCalledWith('No output formats defined');
        });

        it('should throw an error when no formats are defined in `formats` mapping', async () => {
            const error = jest.fn();

            // @ts-ignore intentionally mocking PluginContext
            await imageOptimize({formats: {[Format.PNG]: []}}).load.call({error}, 'foo.png');

            expect(error).toBeCalledWith('No output formats defined');
        });

        it('should throw an error when importing invalid assets', async () => {
            const error = jest.fn();

            // @ts-ignore intentionally mocking PluginContext
            await imageOptimize().load.call({error},'foo.png');

            expect(error).toBeCalledWith('Could not open image file: Error: ENOENT: no such file or directory, open \'foo.png\'');
        });
    });

});