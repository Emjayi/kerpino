"use client"
import { useSearchParams } from "next/navigation"
import type React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { BackButton } from "./buttons"
import { signup } from "@/lib/actions"
import { useFormStatus } from "react-dom"

// Submit button with loading state
function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing up..." : "Sign up"}
        </Button>
    )
}

export default function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
    const [error, setError] = useState<string | null>(null)


    // Client-side form submission wrapper to handle errors
    const handleSubmit = async (formData: FormData) => {
        setError(null)
        try {
            await signup(formData)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Signup failed. Please try again.")
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <BackButton />
            <Card className="overflow-hidden">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form action={handleSubmit} className="p-6 md:p-8">
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center text-center">
                                <h1 className="text-2xl font-bold">Welcome To Kerpino</h1>
                                <p className="text-balance text-muted-foreground">Create a new account</p>
                            </div>

                            {error && <div className="p-3 text-sm text-white bg-destructive rounded-md">{error}</div>}

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                </div>
                                <Input id="password" name="password" type="password" required />
                            </div>
                            <input type="hidden" name="redirectTo" value={callbackUrl} />
                            <SubmitButton />
                            <div className="text-center text-sm">
                                Already have an account?{" "}
                                <Link href="/login" className="underline underline-offset-4">
                                    Login
                                </Link>
                            </div>
                        </div>
                    </form>
                    <div className="relative hidden bg-muted md:block">
                        <Image
                            src="/1.jpg"
                            fill
                            alt="Image"
                            className="absolute inset-0 object-cover dark:brightness-[0.4]"
                        />
                    </div>
                </CardContent>
            </Card>
            <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
                By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </div>
        </div>
    )
}

