import {Format, FormatOptions, PluginOptions} from "./types";
import {Jpg, Webp} from "./FormatOptions";
import path from "path";

/**
 * Takes the imported `filePath` and matches it to a valid `Format` enum value
 * Returns `null` if the input is not a known format to this plugin
 *
 * @param {string} filePath
 * @return {Format|null}
 */
export function normalizeFormatByPath (filePath: string) : Format | null {
    const ext = path.extname(filePath).toLowerCase().replace(/^(\.)/, '');

    switch (ext) {
        case Format.PNG:
            return Format.PNG;

        case Format.JPG:
        case 'jpeg':
            return Format.JPG;

        case Format.WEBP:
            return Format.WEBP;
    }

    return null;
}

/**
 * Takes the imported `filePath` and transforms it to a target `filePath` with a new extension
 * Used when emitting assets
 *
 * @param {string} filePath
 * @param {Format} targetFormat
 * @return {string}
 */
export function normalizeTargetFilePath (filePath: string, targetFormat: Format) : string {
    const basename = path.basename(filePath, path.extname(filePath));

    // TODO: From what I know, it is not possible to keep a directory structure throughout the build
    //       as we do not know an asset base path that we could use to intersect the relative directory
    //       structure. A workaround might be a config option, but for now we'll just flatten the structure
    //       when normalizing. Maybe there also is (or will be) a better solution with rollup.
    return `${basename}.${targetFormat}`;
}


// When normalizing, we remove null values and also turn everything into an array
// that can be mixed instead
export type NormalizedPluginOptions = {
    defaultFormatOptions: FormatOptions[],
    formats: {[key in Format]?: FormatOptions[]}
}

/**
 * Normalizes the `pluginOptions` and merges them with default options
 *
 * The output of this method is not only a merged object, but also of a
 * different type as all options on the input are optional while they
 * shouldn't be optional when accessing them during plugin execution
 *
 * @param {PluginOptions} pluginOptions
 * @return {NormalizedPluginOptions}
 */
export function normalizePluginOptions (pluginOptions?: PluginOptions) : NormalizedPluginOptions {
    const defaultPluginOptions: NormalizedPluginOptions = {
        defaultFormatOptions: [new Jpg(), new Webp()],
        formats: {},
    };

    if (!pluginOptions) {
        return defaultPluginOptions;
    }

    return {
        defaultFormatOptions: typeof pluginOptions.defaultFormatOptions !== 'undefined' ? normalizeFormatOptions(pluginOptions.defaultFormatOptions) : defaultPluginOptions.defaultFormatOptions,
        formats: typeof pluginOptions.formats !== 'undefined' ? normalizeFormats(pluginOptions.formats) : defaultPluginOptions.formats,
    };
}


function normalizeFormats (formats: {[key in Format]?: FormatOptions | FormatOptions[]}) : {[key in Format]?: FormatOptions[]} {
    let convertedFormats: {[key in Format]?: FormatOptions[]} = {};

    function _([format, formatOptions]: [Format, FormatOptions | FormatOptions[]]) {
        convertedFormats[format] = Array.isArray(formatOptions) ? formatOptions : [formatOptions];
    }

    // @ts-ignore I can't get this to work otherwise, a good hint is appreciated :)
    Object.entries(formats).forEach(_);

    return convertedFormats;
}

function normalizeFormatOptions (formatOptions: FormatOptions | FormatOptions[]) : FormatOptions[] {
    if (Array.isArray(formatOptions)) {
        return formatOptions;
    }

    return [formatOptions];
}

