import type { ImageDimensions, Position } from "@/lib/definitions"

// Convert percentage position to pixels
export function percentToPixels(position: Position, imageDimensions: ImageDimensions) {
    const { width, height } = imageDimensions
    return {
        x: (position.x / 100) * width,
        y: (position.y / 100) * height,
        width: (position.width / 100) * width,
        height: (position.height / 100) * height,
    }
}

// Convert pixel position to percentages
export function pixelsToPercent(x: number, y: number, width: number, height: number, imageDimensions: ImageDimensions) {
    const { width: imgWidth, height: imgHeight } = imageDimensions
    return {
        x: (x / imgWidth) * 100,
        y: (y / imgHeight) * 100,
        width: (width / imgWidth) * 100,
        height: (height / imgHeight) * 100,
    }
}

// Download JSON data as a file
export function downloadJSON(data: any, filename: string) {
    // Ensure the data is properly formatted
    const formattedData = {
        plans: [
            {
                unreal_data: {
                    furniture: data,
                },
            },
        ],
    }

    const jsonString = JSON.stringify(formattedData, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()

    // Clean up
    setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }, 100)
}

