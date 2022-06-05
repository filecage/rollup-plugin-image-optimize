import sharp from "sharp";
import {Format} from "./types";
import {Jpg, Png, Webp} from "./FormatOptions";
import * as Buffer from "buffer";

export async function convertPng (png: Png, buffer: Buffer) : Promise<Buffer> {
    return sharp(buffer).png().toBuffer();
}

export async function convertJpg (jpg: Jpg, buffer: Buffer) : Promise<Buffer> {
    return sharp(buffer).jpeg({quality: jpg.quality}).toBuffer();
}

export async function convertWebp (webp: Webp, buffer: Buffer) : Promise<Buffer> {
    return sharp(buffer).webp().toBuffer();
}

// TODO: Types for this export?
const converters: {[key in Format]: Function} = {
    [Format.JPG]: convertJpg,
    [Format.PNG]: convertPng,
    [Format.WEBP]: convertWebp,
};

export default converters;