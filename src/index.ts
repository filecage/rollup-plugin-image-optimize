import {Buffer} from 'buffer';
import {promises as fs} from 'fs';
import {OutputAsset, OutputChunk, Plugin} from 'rollup';
import {Format, PluginOptions} from './types';
import {NormalizedPluginOptions, normalizeFormatByPath, normalizePluginOptions, normalizeTargetFilePath} from "./normalizers";
import converters from "./converters";

export default function imageOptimize (pluginOptions?: PluginOptions) : Plugin {
    const normalizedPluginOptions: NormalizedPluginOptions = normalizePluginOptions(pluginOptions);

    return {
        name: 'imageOptimize',

        async load (filePath: string) {
            // TODO: Configurable input formats
            const inputFormat = normalizeFormatByPath(filePath);
            if (inputFormat === null) {
                return;
            }

            const outputRoutine = normalizedPluginOptions.formats[inputFormat] || normalizedPluginOptions.defaultFormatOptions;
            if (!outputRoutine.length) {
                return this.error('No output formats defined');
            }

            let buffer;
            try {
                buffer = await fs.readFile(filePath);
            } catch (e) {
                return this.error(`Could not open image file: ${e}`);
            }

            let emittedFiles: { [key in Format]?: string } = {};
            for (const targetFormatOptions of outputRoutine) {
                const converter = converters[targetFormatOptions.format];
                const output: Buffer = await converter(targetFormatOptions, Buffer.from(buffer));

                const assetReference = this.emitFile({
                    type: 'asset',
                    name: normalizeTargetFilePath(filePath, targetFormatOptions.format),
                    source: output
                });

                // TODO: When using this in a vite/sveltekit configuration, the path is system absolute which we want to avoid
                emittedFiles[targetFormatOptions.format] = `__ROLLUP_PLUGIN_IMAGE_OPTIMIZE_ASSET__${assetReference}__`;
            }

            // TODO: A type definition for image inputs
            return "const __asset = {};\n"
                + Object.values(Format).map((format: Format) => renderFormatProperty(format, emittedFiles[format])).join("\n")
                + "\nexport default __asset;";
        },

        // The PluginContext method `getFileName` is only available when generating the bundle
        // So we'll have to replace our previously set stubs when generating the bundle
        generateBundle (options, bundle): void {
            Object.values(bundle).forEach((output: OutputAsset | OutputChunk) => {
                if (output.type !== 'chunk') {
                    return;
                }

                output.code = output.code.replaceAll(
                    /__ROLLUP_PLUGIN_IMAGE_OPTIMIZE_ASSET__([a-f0-9]+)__/g,
                    (_, assetReference) => `'${this.getFileName(assetReference)}'`
                );
            })
        }
    };
}

function renderFormatProperty(format: Format, assetReference: string | undefined) : string {
    // TODO: Allow suppressing this output or implement tree shaking? It probably bloats production builds.
    if (!assetReference) {
        return `Object.defineProperty(__asset, '${format}', {get: () => {throw new Error('rollup-plugin-image-optimize: Asset format ${format} has not been exported. Check your target formats.')}});`
    }

    return `Object.defineProperty(__asset, '${format}', {value: ${assetReference}});`;
}

