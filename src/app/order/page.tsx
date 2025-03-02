"use client"

import { useState } from "react"
import { DesignUpload } from "@/app/ui/design-upload"
import { ObjectSelection } from "@/app/ui/object-selection"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import { OrderForm } from "../ui/order-form";

export default function Page() {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        companyName: "",
        position: "",
        companyWebsite: "",
        email: "",
        phone: "",
        hasWhatsApp: false,
        whatsAppNumber: "",
        designPlan: undefined,
        dimensions: {
            value: "",
            unit: "meters",
        },
        selectedObjects: [],
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

    const totalSteps = 2; // Adjust this based on the total number of steps
    const progressWidth = ((step - 1) / totalSteps) * 90;

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold text-center mb-8">New Order</h1>

            {/* Progress indicator */}

            <div className="flex justify-between mb-8 relative">
                <div
                    className="absolute top-[20px] left-8 right-8 h-1 -translate-y-1/2 bg-black transition-width duration-300"
                    style={{ width: `${progressWidth}%` }}
                ></div>

                <div className={`relative z-10 flex flex-col items-center gap-2`}>
                    <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-zinc-200 text-muted-foreground"}`}
                    >
                        {step > 1 ? <CheckCircle2 className="h-6 w-6" /> : 1}
                    </div>
                    <span className="text-sm font-medium">Registration</span>
                </div>

                <div className={`relative z-10 flex flex-col items-center gap-2`}>
                    <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-zinc-200 text-muted-foreground"}`}
                    >
                        {step > 2 ? <CheckCircle2 className="h-6 w-6" /> : 2}
                    </div>
                    <span className="text-sm font-medium">Design Upload</span>
                </div>

                <div className={`relative z-10 flex flex-col items-center gap-2`}>
                    <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? "bg-primary text-primary-foreground" : "bg-zinc-200 text-muted-foreground"}`}
                    >
                        {step > 3 ? <CheckCircle2 className="h-6 w-6" /> : 3}
                    </div>
                    <span className="text-sm font-medium">Object Selection</span>
                </div>
            </div>

            <Card className="mb-8">
                <CardContent className="pt-6">
                    {step === 1 && <OrderForm formData={formData} updateFormData={updateFormData} onNext={nextStep} />}

                    {step === 2 && (
                        <DesignUpload formData={formData} updateFormData={updateFormData} onNext={nextStep} onBack={prevStep} />
                    )}

                    {step === 3 && <ObjectSelection formData={formData} updateFormData={updateFormData} onBack={prevStep} />}
                </CardContent>
            </Card>

            {step === 3 && (
                <div className="flex justify-center">
                    <Button onClick={() => alert("Order submitted successfully!")} size="lg">
                        Submit Order
                    </Button>
                </div>
            )}
        </div>
    );
}