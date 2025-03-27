"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import { AvatarUpload } from "./avatar-upload"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    companyName: z.string().optional(),
    position: z.string().optional(),
    companyWebsite: z.string().optional(),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    hasWhatsApp: z.boolean().default(false),
    whatsAppNumber: z.string().optional(),
    avatarUrl: z.string().optional(),
})

interface ProfileFormProps {
    onComplete?: () => void
    isDrawer?: boolean
}

export function Settings({ onComplete, isDrawer = false }: ProfileFormProps) {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const supabase = createClient()
    const [userId, setUserId] = useState<string | null>(null)

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            dateOfBirth: "",
            companyName: "",
            position: "",
            companyWebsite: "",
            email: "",
            phone: "",
            hasWhatsApp: false,
            whatsAppNumber: "",
            avatarUrl: "",
        },
    })

    useEffect(() => {
        async function getProfile() {
            try {
                setLoading(true)

                const {
                    data: { session },
                } = await supabase.auth.getSession()
                if (!session) return

                setUserId(session.user.id)

                const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

                if (error && error.code !== "PGRST116") throw error

                if (profile) {
                    form.reset({
                        firstName: profile.first_name || "",
                        lastName: profile.last_name || "",
                        dateOfBirth: profile.date_of_birth || "",
                        companyName: profile.company_name || "",
                        position: profile.position || "",
                        companyWebsite: profile.company_website || "",
                        email: profile.email || "",
                        phone: profile.phone || "",
                        hasWhatsApp: profile.has_whatsapp || false,
                        whatsAppNumber: profile.whatsapp_number || "",
                        avatarUrl: profile.avatar_url || "",
                    })
                }
            } catch (error) {
                console.error("Error loading profile:", error)
                toast.error("Failed to load profile data")
            } finally {
                setLoading(false)
            }
        }

        getProfile()
    }, [])

    function handleAvatarUpload(url: string) {
        form.setValue("avatarUrl", url)
    }

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            setSaving(true)
            const {
                data: { session },
            } = await supabase.auth.getSession()
            if (!session) throw new Error("No user session found")

            const { error } = await supabase.from("profiles").upsert({
                id: session.user.id,
                first_name: data.firstName,
                last_name: data.lastName,
                date_of_birth: data.dateOfBirth,
                company_name: data.companyName,
                position: data.position,
                company_website: data.companyWebsite,
                email: data.email,
                phone: data.phone,
                has_whatsapp: data.hasWhatsApp,
                whatsapp_number: data.whatsAppNumber,
                avatar_url: data.avatarUrl,
                updated_at: new Date().toISOString(),
            })

            if (error) throw error

            // Show success message with Sonner
            toast.success("Profile updated", {
                description: "Your profile has been successfully updated.",
            })

            // Call onComplete callback if provided
            if (onComplete) {
                onComplete()
            }
        } catch (error) {
            console.error("Error updating profile:", error)
            // Show error message with Sonner
            toast.error("Failed to update profile", {
                description: "Please try again later.",
            })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <Card className={isDrawer ? "border-0 shadow-none" : "w-full border-0 shadow-none bg-transparent"}>
                <CardContent className={`space-y-6 ${isDrawer ? "px-0" : ""}`}>
                    <div className="flex justify-start">
                        <Skeleton className="h-24 w-24 rounded-full" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-5 w-32" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
                <CardFooter className={`flex justify-end ${isDrawer ? "px-0" : ""}`}>
                    <Skeleton className="h-10 w-24" />
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card className={isDrawer ? "border-0 shadow-none" : "w-full bg-transparent border-0 shadow-none"}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className={`space-y-6 ${isDrawer ? "px-0 pb-16" : ""}`}>
                        {userId && (
                            <div className=" flex justify-start mb-8 mx-0">
                                <AvatarUpload uid={userId} url={form.watch("avatarUrl") || ""} onUpload={handleAvatarUpload} />
                            </div>
                        )}
                        <div className=" space-y-4">
                            <h2 className="text-xl font-semibold">Personal Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                First Name <span className="text-red-600">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="John" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Last Name <span className="text-red-600">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="dateOfBirth"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Date of Birth <span className="text-red-600">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Company Information</h2>

                            <FormField
                                control={form.control}
                                name="companyName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Company Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Acme Inc." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="position"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Position</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Interior Designer" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="companyWebsite"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Company Website</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Contact Information</h2>

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Email <span className="text-red-600">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="john.doe@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Phone Number <span className="text-red-600">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="+1 (555) 123-4567" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="hasWhatsApp"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Do you have WhatsApp on this number?</FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            {!form.watch("hasWhatsApp") && (
                                <FormField
                                    control={form.control}
                                    name="whatsAppNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>WhatsApp Number (if different)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+1 (555) 987-6543" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className={`flex justify-end ${isDrawer ? "px-0 pt-4" : ""}`}>
                        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Profile"
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    )
}

