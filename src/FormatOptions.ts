import {Format} from './types';

interface FormatOptions {
    readonly format: Format;
}

export class Jpg implements FormatOptions {
    format = Format.JPG;

    readonly quality: number;

    constructor({quality = 80}: { quality?: number } = {}) {
        this.quality = quality;
    }
}

export class Png implements FormatOptions {
    format = Format.PNG;
}

export class Webp implements FormatOptions {
    format = Format.WEBP;
}