import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/utils/supabase/middleware"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
    try {
        // Create a response and send it back
        const response = await updateSession(request)

        // Create a Supabase client
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return request.cookies.get(name)?.value
                    },
                    set(name: string, value: string, options: any) {
                        response.cookies.set({
                            name,
                            value,
                            ...options,
                        })
                    },
                    remove(name: string, options: any) {
                        response.cookies.set({
                            name,
                            value: "",
                            ...options,
                        })
                    },
                },
            },
        )

        // Use getUser() instead of getSession() for security
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser()

        // Get the path
        const path = request.nextUrl.pathname

        // If user is authenticated and trying to access login or signup pages, redirect to dashboard
        if (user && (path === "/login" || path === "/signup" || path === "/")) {
            return NextResponse.redirect(new URL("/dashboard", request.url))
        }

        // If not authenticated or error, redirect to login for protected routes
        if (error || !user) {
            if (
                path.startsWith("/dashboard") ||
                path.startsWith("/order") ||
                path.startsWith("/profile")
            ) {
                return NextResponse.redirect(new URL("/login", request.url))
            }
            return response
        }

        // Check if profile exists
        const { data: profile } = await supabase.from("profiles").select("id, first_name").eq("id", user.id).single()

        // If authenticated but no profile, redirect to profile completion
        // except if they're already on the profile page
        if (!profile?.first_name && !path.startsWith("/profile")) {
            return NextResponse.redirect(new URL("/profile", request.url))
        }

        return response
    } catch (error) {
        console.error("Middleware error:", error)
        return NextResponse.next({
            request: {
                headers: request.headers,
            },
        })
    }
}

export const config = {
    matcher: [
        "/",
        "/login",
        "/signup",
        "/dashboard/:path*",
        "/order/:path*",
        "/profile/:path*",
        "/profile"
    ],
}
