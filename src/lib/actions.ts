"use server"

import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { v4 as uuidv4 } from "uuid"

// Helper function to create Supabase client
async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        cookies: {
            get(name: string) {
                return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
                cookieStore.set({ name, value, ...options })
            },
            remove(name: string, options: CookieOptions) {
                cookieStore.set({ name, value: "", ...options })
            },
        },
    })
}

// Login action
export async function login(formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const redirectTo = (formData.get("redirectTo") as string) || "/dashboard"

    if (!email || !password) {
        throw new Error("Email and password are required")
    }

    try {
        const supabase = await createClient()

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            throw new Error(error.message)
        }

        // Check if profile is complete
        const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("id", data.user.id)
            .single()

        // Add a delay before redirecting (1 second)
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // If profile is incomplete, redirect to profile page
        if (!profile || !profile.first_name || !profile.last_name) {
            redirect(`/profile?next=${encodeURIComponent(redirectTo)}`)
        }

        // Redirect to the specified URL after successful login
        redirect(redirectTo)
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error("An error occurred during login")
    }
}

// Signup action - only collects email and password
export async function signup(formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string
    const redirectTo = (formData.get("redirectTo") as string) || "/dashboard"

    // Validate inputs
    if (!email || !password || !confirmPassword) {
        throw new Error("All fields are required")
    }

    if (password !== confirmPassword) {
        throw new Error("Passwords do not match")
    }

    if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long")
    }

    try {
        const supabase = await createClient()

        // Create the user
        const {
            data: { user },
            error: signUpError,
        } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
            },
        })

        if (signUpError) {
            throw new Error(signUpError.message)
        }

        if (!user) {
            throw new Error("Failed to create user")
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString() // 6-digit OTP

        // Store OTP in database with expiry (30 minutes)
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now

        // Create a temporary record in the otp_verifications table
        const { error: otpError } = await supabase.from("otp_verifications").insert({
            id: uuidv4(),
            user_id: user.id,
            email: email,
            otp: otp,
            expires_at: expiresAt.toISOString(),
            verified: false,
        })

        if (otpError) {
            console.error("Error storing OTP:", otpError)
            throw new Error("Failed to create verification code")
        }

        // Send OTP via email
        const { error: emailError } = await supabase.functions.invoke("send-otp-email", {
            body: { email, otp },
        })

        if (emailError) {
            console.error("Error sending OTP email:", emailError)
            throw new Error("Failed to send verification code")
        }

        // Return user ID for the client to store
        return { userId: user.id }
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error("An error occurred during signup")
    }
}

// Verify OTP
export async function verifyOtp(formData: FormData) {
    const email = formData.get("email") as string
    const otp = formData.get("otp") as string
    const userId = formData.get("userId") as string

    if (!email || !otp || !userId) {
        throw new Error("Email, OTP, and user ID are required")
    }

    try {
        const supabase = await createClient()

        // Verify OTP
        const { data, error } = await supabase
            .from("otp_verifications")
            .select("*")
            .eq("user_id", userId)
            .eq("email", email)
            .eq("otp", otp)
            .gt("expires_at", new Date().toISOString())
            .eq("verified", false)
            .single()

        if (error || !data) {
            throw new Error("Invalid or expired verification code")
        }

        // Mark OTP as verified
        await supabase.from("otp_verifications").update({ verified: true }).eq("id", data.id)

        // Sign in the user
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password: formData.get("password") as string,
        })

        if (signInError) {
            throw new Error(signInError.message)
        }

        return { success: true }
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error("An error occurred during OTP verification")
    }
}

// Complete profile
export async function completeProfile(formData: FormData) {
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const redirectTo = (formData.get("redirectTo") as string) || "/dashboard"

    if (!firstName || !lastName) {
        throw new Error("First name and last name are required")
    }

    try {
        const supabase = await createClient()

        // Get current user
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
            throw new Error("User not authenticated")
        }

        // Create or update profile with admin rights
        const { error: profileError } = await supabase.functions.invoke("create-profile", {
            body: {
                userId: user.id,
                firstName,
                lastName,
                email: user.email,
            },
        })

        if (profileError) {
            throw new Error("Failed to create profile")
        }

        // Add a delay before redirecting (1 second)
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Redirect to the specified URL after successful profile completion
        redirect(redirectTo)
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error("An error occurred during profile completion")
    }
}

// Google sign-in action
export async function signInWithGoogle(redirectTo = "/dashboard") {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        },
    })

    if (error) {
        throw new Error(error.message)
    }

    redirect(data.url)
}

// Sign out action
export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/login")
}

// Fetch user profile
export async function fetchUserProfile(userId: string) {
    try {
        const supabase = await createClient()

        const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single()

        if (error) {
            throw new Error(error.message)
        }

        return profile
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error("An error occurred while fetching the user profile")
    }
}

