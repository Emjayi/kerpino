"use server"

import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

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

export async function login(formData: FormData,) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Email and password are required" };
    }

    try {
        const supabase = await createClient();

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return { error: error.message };
        }

        // Check if profile is complete
        const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("id", data.user.id)
            .single();

        // Add a delay before redirecting (1 second)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // If profile is incomplete, redirect to profile page
        if (!profile || !profile.first_name || !profile.last_name) {
            return redirect(`/profile?next=${encodeURIComponent("/dashboard")}`);
        }

        // Always redirect to the dashboard after successful login
        return redirect("/dashboard");
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
        return { error: "An error occurred during login" };
    }
}

// Signup action using email OTP
export async function signup(formData: FormData) {
    const email = formData.get("email") as string;
    const redirectTo = (formData.get("redirectTo") as string) || "/dashboard";

    if (!email) {
        throw new Error("Email is required");
    }

    try {
        const supabase = await createClient();

        // Check if the email is already registered
        const { data: existingUser, error: fetchError } = await supabase
            .from("profiles") // Replace "profiles" with the correct table name if needed
            .select("email")
            .eq("email", email)
            .single();

        if (fetchError) {
            throw new Error("Error checking existing users");
        }

        if (existingUser) {
            throw new Error("Email is already registered");
        }

        // Send OTP to the user's email
        const { data, error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
            },
        });

        if (error) {
            throw new Error(error.message);
        }

        // Inform the user to check their email for the OTP
        return { message: "Check your email for the OTP to complete the sign-up process." };
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("An error occurred during signup");
    }
}

// Verify OTP action
export async function verifyOtp(formData: FormData) {
    const email = formData.get("email") as string
    const token = formData.get("otp") as string
    const password = formData.get("password") as string
    const redirectTo = (formData.get("redirectTo") as string) || "/dashboard"

    if (!email || !token) {
        throw new Error("Email and OTP are required")
    }

    if (!password || password.length < 8) {
        throw new Error("Password must be at least 8 characters long")
    }

    try {
        const supabase = await createClient()

        // First, verify the OTP
        const { error: otpError } = await supabase.auth.verifyOtp({
            email,
            token,
            type: "email",
        })

        if (otpError) {
            throw new Error(otpError.message)
        }

        // After OTP verification, update the user's password
        const { error: updateError } = await supabase.auth.updateUser({
            password,
        })

        if (updateError) {
            throw new Error(updateError.message)
        }

        // Redirect to the specified URL after successful verification
        return redirect(redirectTo)
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
        return redirect(redirectTo)
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error("An error occurred during profile completion")
    }
}

// Google sign-in action
export async function signInWithGoogle(redirectTo = "/dashboard") {
    try {
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

        // Return the URL instead of redirecting
        return { url: data.url }
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error("An error occurred during Google sign-in")
    }
}

// Sign out action
export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return redirect("/")
}

// Fetch user profile
export async function fetchUserProfile(userId: string) {
    try {
        const supabase = await createClient()

        const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

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

