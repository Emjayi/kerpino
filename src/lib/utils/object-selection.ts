import type { Position, ImageDimensions } from '../types/object-selection'

export const percentToPixels = (position: Position, imageDimensions: ImageDimensions) => {
    const { width, height } = imageDimensions
    return {
        x: (position.x / 100) * width,
        y: (position.y / 100) * height,
        width: (position.width / 100) * width,
        height: (position.height / 100) * height,
    }
}

export const pixelsToPercent = (
    x: number,
    y: number,
    width: number,
    height: number,
    imageDimensions: ImageDimensions
): Position => {
    const { width: imgWidth, height: imgHeight } = imageDimensions
    return {
        x: (x / imgWidth) * 100,
        y: (y / imgHeight) * 100,
        width: (width / imgWidth) * 100,
        height: (height / imgHeight) * 100,
    }
}

export const getBoxStyle = (obj: Position, imageDimensions: ImageDimensions): React.CSSProperties => {
    const { width, height } = imageDimensions
    const pixelX = (obj.x / 100) * width
    const pixelY = (obj.y / 100) * height
    const pixelWidth = (obj.width / 100) * width
    const pixelHeight = (obj.height / 100) * height

    return {
        left: `${pixelX}px`,
        top: `${pixelY}px`,
        width: `${pixelWidth}px`,
        height: `${pixelHeight}px`,
        transform: "translate(-50%, -50%)",
    }
} 