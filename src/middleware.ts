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

        // If not authenticated or error, redirect to login for protected routes
        if (error || !user) {
            // Allow access to public pages
            if (
                path === "/" ||
                path === "/login" ||
                path === "/blog" ||
                path === "/faq" ||
                path === "/signup" ||
                path.startsWith("/reset-password") ||
                path.startsWith("/auth") ||
                path === "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)"
            ) {
                return response
            }

            // For any other page, redirect to login with next parameter
            const loginUrl = new URL("/login", request.url)
            loginUrl.searchParams.set("next", path)
            return NextResponse.redirect(loginUrl)
        }

        // User is authenticated

        // If trying to access login or signup pages, redirect to dashboard
        if (path === "/login" || path === "/signup") {
            return NextResponse.redirect(new URL("/dashboard", request.url))
        }

        // Check if profile exists and is complete
        const { data: profile } = await supabase
            .from("profiles")
            .select("id, first_name, last_name")
            .eq("id", user.id)
            .single()

        // If authenticated but no profile or incomplete profile, redirect to profile completion
        // except if they're already on the profile page
        if ((!profile || !profile.first_name || !profile.last_name) && !path.startsWith("/profile")) {
            // Store the original destination in the URL
            const profileUrl = new URL("/profile", request.url)
            if (path !== "/" && path !== "/dashboard") {
                profileUrl.searchParams.set("next", path)
            }
            return NextResponse.redirect(profileUrl)
        }

        // FIX: Always return the response for authenticated users to allow navigation
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
    matcher: ["/((?!api).*)"],
}

