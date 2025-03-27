"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "@/lib/actions"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import { Loader2, User, PenLine } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ProfileDrawer } from "@/app/ui/dashboard/profile-drawer"

interface ProfileData {
    first_name?: string
    last_name?: string
    avatar_url?: string
    email?: string
}

export function ProfileButton() {
    const [loading, setLoading] = useState(true)
    const [profileData, setProfileData] = useState<ProfileData>({})
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        async function fetchUserProfile() {
            try {
                setLoading(true)

                // Get the current session
                const {
                    data: { session },
                } = await supabase.auth.getSession()
                if (!session) return

                // Get user email from auth
                const email = session.user.email

                // Get profile data
                const { data: profile, error } = await supabase
                    .from("profiles")
                    .select("first_name, last_name, avatar_url")
                    .eq("id", session.user.id)
                    .single()

                if (error && error.code !== "PGRST116") {
                    console.error("Error fetching profile:", error)
                    return
                }

                setProfileData({
                    ...profile,
                    email,
                })
            } catch (error) {
                console.error("Error fetching user data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchUserProfile()
    }, [])

    // Get user initials for avatar fallback
    const getInitials = () => {
        if (profileData.first_name && profileData.last_name) {
            return `${profileData.first_name[0]}${profileData.last_name[0]}`.toUpperCase()
        }
        if (profileData.email) {
            return profileData.email[0].toUpperCase()
        }
        return "U"
    }

    // Get display name
    const getDisplayName = () => {
        if (profileData.first_name && profileData.last_name) {
            return `${profileData.first_name} ${profileData.last_name}`
        }
        if (profileData.first_name) {
            return profileData.first_name
        }
        if (profileData.email) {
            return profileData.email.split("@")[0]
        }
        return "User"
    }

    // Get avatar URL
    const getAvatarUrl = () => {
        if (!profileData.avatar_url) return null

        return supabase.storage.from("avatars").getPublicUrl(profileData.avatar_url).data.publicUrl
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Avatar className="h-9 w-9 border-2 border-primary/10">
                            <AvatarImage src={getAvatarUrl() || "/placeholder.svg?height=36&width=36"} alt={getDisplayName()} />
                            <AvatarFallback>{getInitials()}</AvatarFallback>
                        </Avatar>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
                        <p className="text-xs leading-none text-muted-foreground">{profileData.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ProfileDrawer>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <PenLine className="mr-2 h-4 w-4" />
                        <span>Update Profile</span>
                    </DropdownMenuItem>
                </ProfileDrawer>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <button onClick={signOut} type="submit" className="w-full text-left flex items-center">
                        Sign Out
                    </button>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

