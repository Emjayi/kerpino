"use client"

import { useState } from "react"
import { DesignUpload } from "@/app/ui/order/design-upload"
import { ObjectSelectionAndResources } from "@/app/ui/order/object-selection"
import { RoomCustomizationAndShowroom } from "@/app/ui/order/room-customize"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function KerpinoRegistration() {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        // ... (previous registration and design upload fields)
        selectedObjects: [],
        objectResources: {},
        roomCustomization: {
            floorMaterial: "",
            wallTexture: "",
            framesMaterial: "",
            framesColor: "",
            windowModel: "",
            doorModel: "",
            doorMaterial: "",
        },
        showroomStatus: 0,
        showroomLink: "",
        feedback: {
            serviceQuality: 0,
            showroomSpeed: 0,
        },
    })

    const updateFormData = (data: any) => {
        setFormData((prev) => ({ ...prev, ...data }))
    }

    const nextStep = () => {
        setStep((prev) => prev + 1)
        window.scrollTo(0, 0)
    }

    const prevStep = () => {
        setStep((prev) => prev - 1)
        window.scrollTo(0, 0)
    }

    const totalSteps = 3
    const progressWidth = ((step - 1) / totalSteps) * 115;

    return (
        <div className=" mx-auto py-10 px-4 grid gap-8 md:grid-cols-12">
            <div className="hidden md:block top-[90px] h-32 col-span-2">

            </div>
            <div className="fixed top-[90px] h-32 col-span-2">
                <h1 className="text-xl font-bold mb-8">New Order</h1>

                {/* Progress indicator */}
                <div className="flex flex-col gap-20 justify-between mb-8 relative">
                    <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 z-0"></div>
                    <div
                        className="absolute top-[20px] left-8 right-8 h-1 -translate-y-1/2 bg-black transition-width duration-300"
                        style={{ width: `${progressWidth}%` }}
                    ></div>

                    {Array.from({ length: totalSteps }, (_, i) => (
                        <div key={i} className={`relative z-10 flex flex-col items-center gap-2`}>
                            <div
                                className={`w-10 h-10 rounded-full flex items-center bg-black justify-center ${step > i + 1
                                    ? "bg-primary text-primary-foreground"
                                    : step === i + 1
                                        ? "bg-primary text-primary-foreground"
                                        : "dark:bg-zinc-800 bg-zinc-200 text-muted-foreground"
                                    }`}
                            >
                                {step > i + 1 ? <CheckCircle2 className="h-6 w-6" /> : i + 1}
                            </div>
                            <span className="text-sm font-medium hidden md:block">
                                {i === 0 ? "Upload Plan" : i === 1 ? "Select Objects" : "Customize Room"}
                            </span>
                        </div>
                    ))}
                </div>
                <Button className="fixed bottom-16"><Link href="/">Back to home</Link></Button>
            </div>

            <Card className="mb-8 col-span-12 lg:col-span-8 md:col-span-10">
                <CardContent className="pt-6">
                    {step === 1 && (
                        <DesignUpload formData={formData} updateFormData={updateFormData} onNext={nextStep} onBack={prevStep} />
                    )}
                    {step === 2 && (
                        <ObjectSelectionAndResources
                            formData={formData}
                            updateFormData={updateFormData}
                            onNext={nextStep}
                            onBack={prevStep}
                        />
                    )}
                    {step === 3 && (
                        <RoomCustomizationAndShowroom
                            formData={formData}
                            updateFormData={updateFormData}
                            onFinish={() => alert("Thank you for using Kerpino Design Services!")}
                            onBack={prevStep}
                        />
                    )}
                </CardContent>
            </Card>

            <div className="hidden lg:col-span-2 sticky top-[90px] h-32 lg:flex justify-start">
                <h1 className="text-xl font-bold inline">Help</h1>

            </div>
        </div>
    )
}

