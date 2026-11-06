const OUTPUT_SIZE = 256;
const OUTPUT_QUALITY = 0.82;

export const isImageUrl = (value: string | null): value is string =>
    !!value && /^(https?:|data:image\/|blob:)/.test(value);

/** Originals from this session, kept so a bulk upload can be re-cropped from full resolution. */
const originals = new Map<string, string>();

export const rememberOriginal = (itemId: string, file: Blob) =>
    originals.set(itemId, URL.createObjectURL(file));

export const originalFor = (itemId: string) => originals.get(itemId);

/**
 * A URL for reading an image's pixels on a canvas. Tiles load images without
 * CORS, and that cached response is then refused for a CORS request, so the
 * query string makes this a separate cache entry. All the image CDNs ignore it.
 */
export const corsUrl = (src: string) =>
    src.startsWith("http")
        ? `${src}${src.includes("?") ? "&" : "?"}cors=1`
        : src;

export function loadImage(src: string, cors = false): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        if (cors) image.crossOrigin = "anonymous";
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Couldn't load that image"));
        image.src = cors ? corsUrl(src) : src;
    });
}

export interface CropBox {
    /** Top-left of the square, in source pixels. */
    x: number;
    y: number;
    size: number;
}

export function renderSquare(image: HTMLImageElement, crop: CropBox): string {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = OUTPUT_SIZE;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");

    // JPEG has no alpha; transparent PNGs would otherwise turn black.
    context.fillStyle = "#fff";
    context.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    context.imageSmoothingQuality = "high";
    context.drawImage(
        image,
        crop.x,
        crop.y,
        crop.size,
        crop.size,
        0,
        0,
        OUTPUT_SIZE,
        OUTPUT_SIZE
    );
    // JPEG rather than WebP because Safari can't encode WebP from a canvas.
    return canvas.toDataURL("image/jpeg", OUTPUT_QUALITY);
}

/** Center crop, biased upward because faces tend to sit in the top half. */
export function defaultCrop(width: number, height: number): CropBox {
    const size = Math.min(width, height);
    return {
        size,
        x: (width - size) / 2,
        y: height > width ? (height - size) * 0.2 : (height - size) / 2,
    };
}

export async function fileToTileImage(file: Blob): Promise<string> {
    const url = URL.createObjectURL(file);
    try {
        const image = await loadImage(url);
        return renderSquare(
            image,
            defaultCrop(image.naturalWidth, image.naturalHeight)
        );
    } finally {
        URL.revokeObjectURL(url);
    }
}

/** Camera-roll filenames are noise, so only keep names a person wrote. */
export function nameFromFile(fileName: string): string {
    const stem = fileName.replace(/\.[a-z0-9]+$/i, "");
    const generated =
        /^(img|image|dsc|dcim|pxl|photo|picture|screenshot|screen shot|signal|whatsapp|mvimg|fb_img|download)[\s_-]?[\d(-]/i.test(
            stem
        ) ||
        /^image$/i.test(stem) ||
        /^[\d\s_()-]+$/.test(stem) ||
        /^[0-9a-f-]{16,}$/i.test(stem);
    if (generated) return "";

    return stem.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}
