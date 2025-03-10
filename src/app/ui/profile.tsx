"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

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
})

export function ProfileForm({ formData, updateFormData, onNext }: any) {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            dateOfBirth: formData.dateOfBirth,
            companyName: formData.companyName,
            position: formData.position,
            companyWebsite: formData.companyWebsite,
            email: formData.email,
            phone: formData.phone,
            hasWhatsApp: formData.hasWhatsApp,
            whatsAppNumber: formData.whatsAppNumber || "",
        },
    })

    const onSubmit = (data: z.infer<typeof formSchema>) => {
        updateFormData(data)
        onNext()
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Personal Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name <span className="text-red-600">*</span></FormLabel>
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
                                    <FormLabel>Last Name <span className="text-red-600">*</span></FormLabel>
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
                                <FormLabel>Date of Birth <span className="text-red-600">*</span></FormLabel>
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
                                <FormLabel>Email <span className="text-red-600">*</span></FormLabel>
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
                                <FormLabel>Phone Number <span className="text-red-600">*</span></FormLabel>
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

                <div className="flex justify-end">
                    <Button type="submit">Continue to Design Upload</Button>
                </div>
            </form>
        </Form>
    )
}

