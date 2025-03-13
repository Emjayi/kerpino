"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Upload, Info } from "lucide-react"
import Image from "next/image"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const formSchema = z.object({
  designPlan: z
    .any()
    .optional()
    .refine((file) => file !== null, "Bedroom plan is required"),
  dimensionValue: z.string().min(1, "Dimension value is required"),
  dimensionUnit: z.enum(["feet", "meters"], {
    required_error: "Please select a unit",
  }),
})

export function DesignUpload({ formData, updateFormData, onNext }: any) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      designPlan: formData.designPlan,
      dimensionValue: formData.dimensions?.value || "",
      dimensionUnit: formData.dimensions?.unit || "meters",
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      form.setError("designPlan", {
        message: "File size should be less than 5MB",
      })
      return
    }

    // Create preview URL
    if (typeof window !== "undefined") {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }

    // Set file in form
    form.setValue("designPlan", file, { shouldValidate: true })
  }

  const onSubmit = (data: any) => {
    updateFormData({
      designPlan: data.designPlan,
      dimensions: {
        value: data.dimensionValue,
        unit: data.dimensionUnit,
      },
    })
    onNext()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Upload Bedroom Plan</h2>

          <FormField
            control={form.control}
            name="designPlan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bedroom Plan</FormLabel>
                <FormDescription>
                  Please upload your bedroom plan. Accepted formats: JPG, PNG, PDF (max 5MB)
                </FormDescription>
                <FormControl>
                  <div className="grid gap-4">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                      <Input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                        id="design-plan-upload"
                        onChange={handleFileChange}
                      />
                      <Label htmlFor="design-plan-upload" className="cursor-pointer flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-muted-foreground font-medium">
                          {previewUrl ? "Change file" : "Click to upload or drag and drop"}
                        </span>
                      </Label>
                    </div>

                    {previewUrl && (
                      <div className="relative aspect-video w-full max-h-[300px] overflow-hidden rounded-md border">
                        <Image
                          src={previewUrl || "/placeholder.svg"}
                          alt="Bedroom plan preview"
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}

                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Info className="h-4 w-4 mt-0.5" />
                      <p>
                        Your bedroom plan should clearly show the layout of the room. See examples below for reference.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="border col-span-2 rounded-md overflow-hidden">
                        <Image
                          src="/plan/2.jpg?height=500&width=800"
                          alt="Example bedroom plan 1"
                          width={800}
                          height={500}
                          className="w-full h-auto"
                        />
                        <div className="p-2 text-sm text-center">Example 1</div>
                      </div>
                      <div className="border rounded-md overflow-hidden">
                        <Image
                          src="/plan/1.jpg?height=200&width=300"
                          alt="Example bedroom plan 2"
                          width={300}
                          height={200}
                          className="w-full h-auto"
                        />
                        <div className="p-2 text-sm text-center">Example 2</div>
                      </div>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Room Dimensions</h2>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dimensionValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dimension Value</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="e.g. 4x5" {...field} />
                  </FormControl>
                  <FormDescription>Enter dimensions as width x length</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dimensionUnit"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="meters" />
                        </FormControl>
                        <FormLabel className="font-normal">Meters</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="feet" />
                        </FormControl>
                        <FormLabel className="font-normal">Feet</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={previewUrl === null}>
            Continue
          </Button>
        </div>
      </form>
    </Form>
  )
}

