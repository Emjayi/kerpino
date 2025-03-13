import { NextResponse } from "next/server"
import type { ObjectDetectionResponse } from "@/lib/definitions"

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const image = formData.get("image") as File

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 })
        }

        // In a real implementation, you would send the image to an external AI API
        // For this example, we'll simulate a response with mock data

        // Simulate API processing time
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Mock response data
        const mockResponse: ObjectDetectionResponse = {
            objects: [
                {
                    id: 1,
                    x: 25,
                    y: 30,
                    width: 20,
                    height: 15,
                    confidence: 0.92,
                    class: "Bed",
                },
                {
                    id: 2,
                    x: 70,
                    y: 25,
                    width: 15,
                    height: 10,
                    confidence: 0.88,
                    class: "Nightstand",
                },
                {
                    id: 3,
                    x: 45,
                    y: 60,
                    width: 30,
                    height: 20,
                    confidence: 0.85,
                    class: "Dresser",
                },
            ],
            processingTime: 1.2,
        }

        return NextResponse.json(mockResponse)
    } catch (error) {
        console.error("Error detecting objects:", error)
        return NextResponse.json({ error: "Failed to process image" }, { status: 500 })
    }
}

