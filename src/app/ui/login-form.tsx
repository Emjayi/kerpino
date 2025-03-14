"use client"
import { useSearchParams } from "next/navigation"
import type React from "react"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { BackButton } from "./buttons"
import { login, signup } from "@/lib/actions"
import { signInWithGoogle } from "@/lib/actions"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"

// Submit button with loading state
function SubmitButton({ mode }: { mode: string }) {
    const { pending } = useFormStatus()

    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (mode === "signup" ? "Signing up..." : "Logging in...") : mode === "signup" ? "Sign Up" : "Login"}
        </Button>
    )
}

export default function AuthForm({ className, ...props }: React.ComponentProps<"div">) {
    const searchParams = useSearchParams()
    const next = searchParams.get("next")
    const callbackUrl = next || searchParams.get("callbackUrl") || "/dashboard"
    const mode = searchParams.get("mode") || "login"
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const handleGoogleSignIn = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        // Pass the next parameter to the Google sign-in function
        signInWithGoogle(callbackUrl)
    }

    // Client-side form submission wrapper to handle errors and success
    const handleSubmit = async (formData: FormData) => {
        setError(null)
        setSuccess(null)

        // Add the redirectTo parameter to the form data
        formData.append("redirectTo", callbackUrl)

        try {
            if (mode === "signup") {
                await signup(formData)
                setSuccess("Account created successfully! Redirecting...")
            } else {
                await login(formData)
                setSuccess("Logged in successfully! Redirecting...")
            }

            // Add a delay before redirecting (handled by the server action)
            // The server action will handle the actual redirect after the delay
        } catch (err) {
            setError(
                err instanceof Error ? err.message : `${mode === "signup" ? "Signup" : "Login"} failed. Please try again.`,
            )
        }
    }

    // Show toast for success message
    useEffect(() => {
        if (success) {
            toast.success(success)
        }
    }, [success])

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <BackButton />
            <Card className="overflow-hidden">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form action={handleSubmit} className="p-6 md:p-8">
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center text-center">
                                <h1 className="text-2xl font-bold">{mode === "signup" ? "Create an account" : "Welcome back"}</h1>
                                <p className="text-balance text-muted-foreground">
                                    {mode === "signup" ? "Sign up for a Kerpino account" : "Login to your Kerpino account"}
                                </p>
                            </div>

                            {error && <div className="p-3 text-sm text-white bg-destructive rounded-md">{error}</div>}
                            {success && <div className="p-3 text-sm text-white bg-green-600 rounded-md">{success}</div>}

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                            </div>

                            {mode === "signup" && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="firstName">First Name</Label>
                                            <Input id="firstName" name="firstName" placeholder="John" required />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="lastName">Last Name</Label>
                                            <Input id="lastName" name="lastName" placeholder="Doe" required />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    {mode === "login" && (
                                        <Link href="/reset-password" className="ml-auto text-sm underline-offset-2 hover:underline">
                                            Forgot your password?
                                        </Link>
                                    )}
                                </div>
                                <Input id="password" name="password" type="password" required />
                            </div>

                            {mode === "signup" && (
                                <div className="grid gap-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input id="confirmPassword" name="confirmPassword" type="password" required />
                                </div>
                            )}

                            <input type="hidden" name="redirectTo" value={callbackUrl} />
                            <SubmitButton mode={mode} />

                            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                                <span className="relative z-10 bg-background px-2 text-muted-foreground">Or continue with Google</span>
                            </div>

                            <Button onClick={handleGoogleSignIn} variant="outline" className="w-full" type="button">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 mr-2">
                                    <path
                                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                        fill="currentColor"
                                    />
                                </svg>
                                {mode === "signup" ? "Sign up with Google" : "Login with Google"}
                            </Button>

                            <div className="text-center text-sm">
                                {mode === "signup" ? (
                                    <>
                                        Already have an account?{" "}
                                        <Link
                                            href={`/login${callbackUrl ? `?next=${encodeURIComponent(callbackUrl)}` : ""}`}
                                            className="underline underline-offset-4"
                                        >
                                            Login
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        Don&apos;t have an account?{" "}
                                        <Link
                                            href={`/login?mode=signup${callbackUrl ? `&next=${encodeURIComponent(callbackUrl)}` : ""}`}
                                            className="underline underline-offset-4"
                                        >
                                            Sign up
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </form>
                    <div className="relative hidden bg-muted md:block">
                        <Image src="/1.jpg" fill alt="Image" className="absolute inset-0 object-cover dark:brightness-[0.4]" />
                    </div>
                </CardContent>
            </Card>
            <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
                By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </div>
        </div>
    )
}

