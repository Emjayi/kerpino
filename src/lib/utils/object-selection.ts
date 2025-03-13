import type { Position, ImageDimensions } from "@/lib/definitions"

// Convert percentage coordinates to pixel coordinates
export function percentToPixels(position: Position, imageDimensions: ImageDimensions): Position {
    const { width, height } = imageDimensions

    return {
        x: (position.x / 100) * width,
        y: (position.y / 100) * height,
        width: (position.width / 100) * width,
        height: (position.height / 100) * height,
    }
}

// Convert pixel coordinates to percentage coordinates
export function pixelsToPercent(
    x: number,
    y: number,
    width: number,
    height: number,
    imageDimensions: ImageDimensions,
): Position {
    const { width: imgWidth, height: imgHeight } = imageDimensions

    return {
        x: (x / imgWidth) * 100,
        y: (y / imgHeight) * 100,
        width: (width / imgWidth) * 100,
        height: (height / imgHeight) * 100,
    }
}

