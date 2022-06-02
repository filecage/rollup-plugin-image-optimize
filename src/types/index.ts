import {Jpg, Png, Webp} from '../FormatOptions';

export type PluginOptions = {
    // The format(s) that an input file will be converted to if there's
    // no specific definition in the `formatMap`
    defaultFormatOptions?: FormatOptions | FormatOptions[],

    // A map to define conversion formats based on input formats
    // e.g. if you want to convert PNGs to something different than default
    formats?: {
        [key in Format]?: FormatOptions | FormatOptions[]
    }
}

export type FormatOptions = Jpg | Png | Webp;

export enum Format {
    PNG = 'png',
    JPG = 'jpg',
    WEBP = 'webp',
}