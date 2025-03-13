"use server"

import { AuthError } from "next-auth"
import { z } from "zod"
import postgres from "postgres"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(["pending", "paid"]),
    date: z.string(),
})

const CreateInvoice = FormSchema.omit({ id: true, date: true })

// Login form validation schema
const LoginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    redirectTo: z.string().optional(),
})

// Signup form validation schema with additional fields
const SignupSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

export async function createInvoice(formData: FormData) {
    const sql = postgres()
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get("customerId"),
        amount: formData.get("amount"),
        status: formData.get("status"),
    })
    const amountInCents = amount * 100
    const date = new Date().toISOString().split("T")[0]

    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `
}

const signInWith = (provider: any) => async () => {
    const supabase = await createClient()
    const auth_callback_url = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: auth_callback_url },
    })

    if (error) {
        console.error("Error during sign in:", error)
        throw new AuthError("OAuth sign-in failed")
    }

    console.log(data, error)
    redirect(data?.url)
}

export const signInWithGoogle = signInWith("google")

export async function login(formData: FormData) {
    const supabase = await createClient()

    try {
        // Validate form data
        const validatedData = LoginSchema.parse({
            email: formData.get("email"),
            password: formData.get("password"),
            redirectTo: formData.get("redirectTo"),
        })

        // Attempt to sign in
        const { data, error } = await supabase.auth.signInWithPassword({
            email: validatedData.email,
            password: validatedData.password,
        })

        if (error) {
            console.error("Login error:", error)
            throw new Error(error.message || "Login failed")
        }

        // Successful login
        console.log("Login successful", data)
        revalidatePath("/")

        // After successful login, check if profile exists
        const { data: profile } = await supabase.from("profiles").select("first_name").eq("id", data.user.id).single()

        // Redirect to profile completion if no profile exists
        if (!profile?.first_name) {
            redirect("/profile")
        }

        // Redirect to the callback URL or dashboard
        const redirectTo = validatedData.redirectTo || "/dashboard"
        redirect(redirectTo)
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Handle validation errors
            const errorMessage = error.errors.map((e) => e.message).join(", ")
            throw new Error(errorMessage)
        }

        // Re-throw other errors
        throw error
    }
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    try {
        // Validate form data
        const validatedData = SignupSchema.parse({
            email: formData.get("email"),
            password: formData.get("password"),
        })

        // Use signUp instead of signInWithOtp to create a new user with email confirmation
        const { data, error } = await supabase.auth.signUp({
            email: validatedData.email,
            password: validatedData.password,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
            },
        })

        if (error) {
            throw new Error(error.message || "Sign up failed")
        }

        // Check if email confirmation is required
        if (data.user && data.session) {
            // User was signed in automatically (email confirmation might be disabled in Supabase settings)
            revalidatePath("/")
            redirect("/profile")
        } else {
            // Email confirmation is required
            // Redirect to a confirmation page
            return {
                success: true,
                message: "Please check your email for a confirmation link",
                requiresEmailConfirmation: true,
            }
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Handle validation errors
            const errorMessage = error.errors.map((e) => e.message).join(", ")
            throw new Error(errorMessage)
        }

        // Re-throw other errors
        throw error
    }
}

export async function signOut() {
    const supabase = await createClient()

    // Sign out the user
    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error("Error signing out:", error)
        throw new Error("Failed to sign out")
    }

    // Revalidate all pages that might show different content based on auth state
    revalidatePath("/", "layout")

    // Redirect to home page after sign out
    redirect("/")
}

export async function GetUserEmail() {
    const supabase = await createClient()

    // Get the current user
    const { data, error } = await supabase.auth.getUser()

    if (error || !data.user) {
        console.error("Error fetching user:", error)
        throw new Error("Failed to fetch user")
    }

    const userEmail = data.user.email

    return userEmail
}

