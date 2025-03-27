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
import { BackButton } from "@/app/ui/buttons"
import { login, signup, verifyOtp, completeProfile } from "@/lib/actions"
import { signInWithGoogle } from "@/lib/actions"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import { useAuthStore } from "@/lib/auth-store"
import { Loader2 } from "lucide-react"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"

export default function Page() {
    const searchParams = useSearchParams()
    const next = searchParams.get("next")
    const callbackUrl = next || searchParams.get("callbackUrl") || "/dashboard"

    // Auth state from store
    const { email, setEmail, step, setStep, otpSent, setOtpSent, setOtpVerified, setNext, reset } = useAuthStore()

    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [otp, setOtp] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [confirmPassword, setConfirmPassword] = useState<string>("")
    const [firstName, setFirstName] = useState<string>("")
    const [lastName, setLastName] = useState<string>("")

    // Set next URL in store
    useEffect(() => {
        if (callbackUrl) {
            setNext(callbackUrl)
        }
    }, [callbackUrl, setNext])

    const handleGoogleSignIn = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setError(null)

        try {
            // Pass the next parameter to the Google sign-in function
            const result = await signInWithGoogle(callbackUrl)

            // If we get a URL back, redirect to it
            if (result?.url) {
                window.location.href = result.url
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Google login failed. Please try again.")
            toast.error("Google login failed", {
                description: err instanceof Error ? err.message : "Please try again.",
            })
        }
    }

    // Handle login form submission
    const handleLogin = async (formData: FormData) => {
        setError(null)
        setSuccess(null)

        try {
            // Add the redirectTo parameter to the form data
            formData.append("redirectTo", callbackUrl)

            await login(formData)
            setSuccess("Logged in successfully! Redirecting...")
            toast.success("Logged in successfully!")

            // Reset auth store after successful login
            reset()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed. Please try again.")
            toast.error("Login failed", {
                description: err instanceof Error ? err.message : "Please try again.",
            })
        }
    }

    // Handle signup form submission
    const handleSignup = async (formData: FormData) => {
        setError(null)
        setSuccess(null)

        try {
            // Add the redirectTo parameter to the form data
            formData.append("redirectTo", callbackUrl)

            const result = await signup(formData)

            if (result?.message) {
                setOtpSent(true)
                setStep("otp-verification")
                setSuccess("Verification code sent! Please check your email.")
                toast.success("Verification code sent", {
                    description: "Please check your email for the verification code.",
                })
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Signup failed. Please try again.")
            toast.error("Signup failed", {
                description: err instanceof Error ? err.message : "Please try again.",
            })
        }
    }

    // Handle OTP verification
    const handleVerifyOtp = async (formData: FormData) => {
        setError(null)
        setSuccess(null)

        // Validate passwords match
        if (password !== confirmPassword) {
            setError("Passwords do not match")
            toast.error("Verification failed", {
                description: "Passwords do not match",
            })
            return
        }

        // Validate password length
        if (password.length < 8) {
            setError("Password must be at least 8 characters long")
            toast.error("Verification failed", {
                description: "Password must be at least 8 characters long",
            })
            return
        }

        try {
            // Add the OTP value from state to the form data
            formData.append("otp", otp)
            formData.append("email", email)
            formData.append("password", password)
            formData.append("redirectTo", callbackUrl)

            await verifyOtp(formData)
            setOtpVerified(true)
            setSuccess("Verification successful! Redirecting...")
            toast.success("Verification successful")

            // The redirect will be handled by the server action
        } catch (err) {
            setError(err instanceof Error ? err.message : "Verification failed. Please try again.")
            toast.error("Verification failed", {
                description: err instanceof Error ? err.message : "Please try again.",
            })
        }
    }

    // Handle profile completion
    const handleCompleteProfile = async (formData: FormData) => {
        setError(null)
        setSuccess(null)

        try {
            formData.append("redirectTo", callbackUrl)

            await completeProfile(formData)
            setSuccess("Profile completed successfully! Redirecting...")
            toast.success("Profile completed successfully!")

            // Reset auth store after successful profile completion
            reset()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Profile completion failed. Please try again.")
            toast.error("Profile completion failed", {
                description: err instanceof Error ? err.message : "Please try again.",
            })
        }
    }

    // Handle cancel OTP verification
    const handleCancelOtp = () => {
        setStep("signup")
        setOtp("")
        setError(null)
        setSuccess(null)
    }

    // Show toast for success message
    useEffect(() => {
        if (success) {
            toast.success(success)
        }
    }, [success])

    // Render login form
    const renderLoginForm = () => (
        <form action={handleLogin} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                    <h1 className="text-2xl font-bold">Welcome back</h1>
                    <p className="text-balance text-muted-foreground">Login to your Kerpino account</p>
                </div>

                {error && <div className="p-3 text-sm text-white bg-destructive rounded-md">{error}</div>}
                {success && <div className="p-3 text-sm text-white bg-green-600 rounded-md">{success}</div>}

                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="m@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <Link href="/reset-password" className="ml-auto text-sm underline-offset-2 hover:underline">
                            Forgot your password?
                        </Link>
                    </div>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <SubmitButton label="Login" />

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
                    Login with Google
                </Button>

                <div className="text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <button
                        type="button"
                        onClick={() => {
                            setStep("signup")
                            setError(null)
                            setSuccess(null)
                        }}
                        className="underline underline-offset-4 text-primary"
                    >
                        Sign up
                    </button>
                </div>
            </div>
        </form>
    )

    // Render signup form
    const renderSignupForm = () => (
        <form action={handleSignup} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                    <h1 className="text-2xl font-bold">Create an account</h1>
                    <p className="text-balance text-muted-foreground">Sign up for a Kerpino account</p>
                </div>

                {error && <div className="p-3 text-sm text-white bg-destructive rounded-md">{error}</div>}
                {success && <div className="p-3 text-sm text-white bg-green-600 rounded-md">{success}</div>}

                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="m@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <p className="text-xs text-muted-foreground">We&apos;ll send a verification code to this email</p>
                </div>

                <SubmitButton label="Sign Up" />

                <div className="text-center text-sm">
                    Already have an account?{" "}
                    <button
                        type="button"
                        onClick={() => {
                            setStep("login")
                            setError(null)
                            setSuccess(null)
                        }}
                        className="underline underline-offset-4 text-primary"
                    >
                        Login
                    </button>
                </div>
            </div>
        </form>
    )

    // Render OTP verification form
    const renderOtpForm = () => (
        <form action={handleVerifyOtp} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                    <h1 className="text-2xl font-bold">Verify your email</h1>
                    <p className="text-balance text-sm text-muted-foreground">
                        We have sent a verification code to your email. Please enter it below to continue.
                    </p>
                </div>

                {error && <div className="p-3 text-sm text-white bg-destructive rounded-md">{error}</div>}
                {success && <div className="p-3 text-sm text-white bg-green-600 rounded-md">{success}</div>}

                <div className="flex flex-col justify-center items-center">
                    <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS} value={otp} onChange={setOtp}>
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password">Create Password</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={handleCancelOtp}>
                        Cancel
                    </Button>
                    <SubmitButton label="Verify" className="flex-1" />
                </div>
            </div>
        </form>
    )

    // Render profile completion form
    const renderProfileForm = () => (
        <form action={handleCompleteProfile} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                    <h1 className="text-2xl font-bold">Complete your profile</h1>
                    <p className="text-balance text-muted-foreground">
                        Please provide your first and last name to complete your profile.
                    </p>
                </div>

                {error && <div className="p-3 text-sm text-white bg-destructive rounded-md">{error}</div>}
                {success && <div className="p-3 text-sm text-white bg-green-600 rounded-md">{success}</div>}

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                            id="firstName"
                            name="firstName"
                            placeholder="John"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                            id="lastName"
                            name="lastName"
                            placeholder="Doe"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <SubmitButton label="Save" />
            </div>
        </form>
    )

    return (
        <div className="flex min-h-screen py-12 justify-center items-center flex-col gap-6">
            <Card className="w-full max-w-md">
                <div className="relative top-4 left-2">
                    <BackButton />
                </div>
                <CardContent className="grid -mt-[3rem] p-0 md:grid-cols-1">
                    {step === "login" && renderLoginForm()}
                    {step === "signup" && renderSignupForm()}
                    {step === "otp-verification" && renderOtpForm()}
                    {step === "profile-completion" && renderProfileForm()}
                </CardContent>
            </Card>
            <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
                By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </div>
        </div>
    )
}

// Submit button with loading state
function SubmitButton({ label, className }: { label: string; className?: string }) {
    const { pending } = useFormStatus()

    return (
        <Button type="submit" className={cn("w-full", className)} disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {label === "Login"
                        ? "Logging in..."
                        : label === "Sign Up"
                            ? "Signing up..."
                            : label === "Verify"
                                ? "Verifying..."
                                : "Saving..."}
                </>
            ) : (
                label
            )}
        </Button>
    )
}

