import { normalizeFormatByPath, normalizePluginOptions } from './normalizers';
import {Format} from "./types";
import {Jpg, Png, Webp} from "./FormatOptions";

describe('Format by Path Normalization', () => {
    const data = [
        ['/foo/bar/baz.jpg', Format.JPG],
        ['/foo/bar/baz.PNG', Format.PNG],
        ['bingo.webp', Format.WEBP],
        ['foobar', null],
        ['is-a-null-but-ends-withjpg', null],
    ];

    it.each(data)('Normalizes format by file path', (filePath, expectedFormat) => {
        expect(normalizeFormatByPath(filePath || '')).toBe(expectedFormat);
    });
});

describe('Plugin Options Normalization', () => {
   it('Returns a default plugin option if none is provided', () => {
       const pluginOptions = normalizePluginOptions();

       expect(pluginOptions.defaultFormatOptions).toContainEqual(new Jpg());
       expect(pluginOptions.defaultFormatOptions).toContainEqual(new Webp());
       expect(pluginOptions.formats).toEqual({});
   });

   it ('Allows to overwrite `defaultFormatOptions`', () => {
       const pluginOptions = normalizePluginOptions({defaultFormatOptions: new Png()});

       expect(pluginOptions.defaultFormatOptions).toEqual([new Png()]);
   });

   it ('Allows to overwrite `formats`', () => {
       const pluginOptions = normalizePluginOptions({formats: {
           [Format.PNG]: new Png()
       }});

       expect(pluginOptions.formats).toEqual({ [Format.PNG]: [new Png()] });
   })
});