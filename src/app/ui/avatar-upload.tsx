"use client"
import { useState, useEffect } from "react"
import type React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/utils/supabase/client"
import { Loader2, Camera } from "lucide-react"
import { toast } from "sonner"

interface AvatarUploadProps {
    uid: string
    url: string | null
    onUpload: (url: string) => void
}

export function AvatarUpload({ uid, url, onUpload }: AvatarUploadProps) {
    const supabase = createClient()
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)

    // Maximum file size in bytes (2MB)
    const MAX_FILE_SIZE = 2 * 1024 * 1024
    // Allowed file types
    const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]

    useEffect(() => {
        if (url) downloadImage(url)
    }, [url])

    async function downloadImage(path: string) {
        try {
            // Get public URL instead of downloading the file
            const { data } = supabase.storage.from("avatars").getPublicUrl(path)

            if (data?.publicUrl) {
                setAvatarUrl(data.publicUrl)
            }
        } catch (error) {
            console.error("Error getting image URL: ", error)
        }
    }

    async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
        try {
            setUploading(true)

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error("You must select an image to upload.")
            }

            const file = event.target.files[0]

            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                toast.error("File too large", {
                    description: "Please select an image smaller than 2MB",
                })
                return
            }

            // Validate file type
            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                toast.error("Invalid file type", {
                    description: "Please select a JPG, PNG, GIF, or WebP image",
                })
                return
            }

            // Create a unique file name
            const fileExt = file.name.split(".").pop()
            const fileName = `${uid}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`

            // Upload the file to Supabase storage
            const { error: uploadError, data } = await supabase.storage.from("avatars").upload(fileName, file, {
                cacheControl: "3600",
                upsert: true,
            })

            if (uploadError) {
                throw uploadError
            }

            // Call the onUpload callback with the file path
            onUpload(fileName)

            // Update the avatar URL
            const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName)

            if (urlData?.publicUrl) {
                setAvatarUrl(urlData.publicUrl)
            }

            toast.success("Avatar uploaded", {
                description: "Your profile picture has been updated",
            })
        } catch (error) {
            console.error("Error uploading avatar: ", error)
            toast.error("Upload failed", {
                description: "There was a problem uploading your image",
            })
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-background shadow-md">
                    <AvatarImage
                        src={avatarUrl || "/placeholder.svg?height=128&width=128"}
                        alt="Profile"
                        className="object-cover"
                    />
                    <AvatarFallback className="text-2xl">{uid.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                    <Camera className="h-8 w-8" />
                    <input
                        id="avatar-upload"
                        type="file"
                        accept="image/jpeg, image/png, image/gif, image/webp"
                        onChange={uploadAvatar}
                        disabled={uploading}
                        className="hidden"
                    />
                </label>
                {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white rounded-full">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                )}
            </div>
            <div className="text-sm text-muted-foreground">
                {uploading ? "Uploading..." : "Click to upload profile picture"}
            </div>
            <div className="text-xs text-muted-foreground">Max size: 2MB. Formats: JPG, PNG, GIF, WebP</div>
        </div>
    )
}

