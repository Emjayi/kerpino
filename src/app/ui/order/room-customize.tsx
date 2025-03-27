"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const customizationOptions = {
    floorMaterial: ["Hardwood", "Carpet", "Tile", "Vinyl"],
    wallTexture: ["Smooth", "Textured", "Wallpaper", "Exposed Brick"],
    framesMaterial: ["Wood", "Metal", "PVC"],
    framesColor: ["White", "Black", "Brown", "Beige"],
    windowModel: ["Casement", "Double-hung", "Sliding", "Bay"],
    doorModel: ["Panel", "Flush", "French", "Sliding"],
    doorMaterial: ["Wood", "Fiberglass", "Steel", "Glass"],
}

export function RoomCustomizationAndShowroom({ formData, updateFormData, onFinish, onBack }: any) {
    const [customization, setCustomization] = useState(formData.roomCustomization || {})
    const [showroomStatus, setShowroomStatus] = useState(0)
    const [showroomLink, setShowroomLink] = useState("")
    const [feedback, setFeedback] = useState(formData.feedback || { serviceQuality: 0, showroomSpeed: 0 })
    const [step, setStep] = useState("customize") // 'customize', 'showroom', 'feedback'

    const handleCustomizationChange = (field: string, value: any) => {
        setCustomization((prev: any) => ({ ...prev, [field]: value }))
    }

    const handleFeedbackChange = (field: string, value: any) => {
        setFeedback((prev: any) => ({ ...prev, [field]: value }))
    }

    useEffect(() => {
        if (step === "showroom") {
            const interval = setInterval(() => {
                setShowroomStatus((prevStatus) => {
                    if (prevStatus >= 100) {
                        clearInterval(interval)
                        return 100
                    }
                    return prevStatus + 1
                })
            }, 500)

            return () => clearInterval(interval)
        }
    }, [step])

    useEffect(() => {
        if (showroomStatus === 100) {
            setShowroomLink("https://example.com/showroom")
        }
    }, [showroomStatus])

    const handleSubmitCustomization = () => {
        updateFormData({ roomCustomization: customization })
        setStep("showroom")
    }

    const handleSubmitFeedback = () => {
        updateFormData({ feedback })
        onFinish()
    }

    return (
        <div className="space-y-6">
            {step === "customize" && (
                <>
                    <h2 className="text-2xl font-bold">Room Customization</h2>
                    <p className="text-muted-foreground">Please select your preferred options for the following room elements.</p>

                    {Object.entries(customizationOptions).map(([field, options]) => (
                        <Card key={field} className="p-4">
                            <h3 className="text-xl font-semibold mb-4">
                                {field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                            </h3>
                            <RadioGroup
                                onValueChange={(value) => handleCustomizationChange(field, value)}
                                defaultValue={customization[field] || options[0]}
                            >
                                {options.map((option) => (
                                    <div key={option} className="flex items-center space-x-2">
                                        <RadioGroupItem value={option} id={`${field}-${option}`} />
                                        <Label htmlFor={`${field}-${option}`}>{option}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </Card>
                    ))}

                    <div className="flex justify-between">
                        <Button onClick={onBack} variant="outline">
                            Back
                        </Button>
                        <Button onClick={handleSubmitCustomization}>Next</Button>
                    </div>
                </>
            )}

            {step === "showroom" && (
                <div className="h-min-48">
                    <h2 className="text-2xl font-bold">Showroom Preparation</h2>
                    <p className="text-muted-foreground">
                        Please wait while we prepare your showroom. This process usually takes about 20 minutes.
                    </p>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span>Progress</span>
                            <span>{showroomStatus}%</span>
                        </div>
                        <Progress value={showroomStatus} className="w-full" />
                    </div>

                    {showroomLink && (
                        <div className="space-y-4">
                            <p className="font-medium">Your showroom is ready!</p>
                            <p>
                                You can access your showroom at:{" "}
                                <a
                                    href={showroomLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    {showroomLink}
                                </a>
                            </p>
                            <p>An email with this link has also been sent to your registered email address.</p>
                            <Button onClick={() => setStep("feedback")} className="w-full">
                                Provide Feedback
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {step === "feedback" && (
                <>
                    <h2 className="text-2xl font-bold">Feedback</h2>
                    <p className="text-muted-foreground">Please rate your experience with our service and showroom.</p>

                    <div className="space-y-4">
                        <div>
                            <Label className="text-lg font-medium">Service Quality</Label>
                            <RadioGroup
                                onValueChange={(value) => handleFeedbackChange("serviceQuality", Number.parseInt(value))}
                                defaultValue={feedback.serviceQuality.toString()}
                                className="flex space-x-4 mt-2"
                            >
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <div key={rating} className="flex flex-col items-center">
                                        <RadioGroupItem value={rating.toString()} id={`service-quality-${rating}`} />
                                        <Label htmlFor={`service-quality-${rating}`}>{rating}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        <div>
                            <Label className="text-lg font-medium">Showroom Speed</Label>
                            <RadioGroup
                                onValueChange={(value) => handleFeedbackChange("showroomSpeed", Number.parseInt(value))}
                                defaultValue={feedback.showroomSpeed.toString()}
                                className="flex space-x-4 mt-2"
                            >
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <div key={rating} className="flex flex-col items-center">
                                        <RadioGroupItem value={rating.toString()} id={`showroom-speed-${rating}`} />
                                        <Label htmlFor={`showroom-speed-${rating}`}>{rating}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <Button onClick={() => setStep("showroom")} variant="outline">
                            Back
                        </Button>
                        <Button onClick={handleSubmitFeedback}>Submit Feedback</Button>
                    </div>
                </>
            )}
        </div>
    )
}

