"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Upload, Info, FileJson } from "lucide-react"
import Image from "next/image"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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
  jsonData: z.string().optional(),
})

export function DesignUpload({ formData, updateFormData, onNext }: any) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"upload" | "json">("upload")
  const [jsonParseError, setJsonParseError] = useState<string | null>(null)
  const [jsonParseSuccess, setJsonParseSuccess] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      designPlan: formData.designPlan,
      dimensionValue: formData.dimensions?.value || "",
      dimensionUnit: formData.dimensions?.unit || "meters",
      jsonData: formData.jsonData || "",
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

    // Resize image to 1024x1024 if it's an image
    if (file.type.startsWith("image/")) {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        canvas.width = 1024
        canvas.height = 1024
        const ctx = canvas.getContext("2d")

        if (ctx) {
          // Draw image maintaining aspect ratio within the square
          const scale = Math.min(1024 / img.width, 1024 / img.height)
          const x = (1024 - img.width * scale) / 2
          const y = (1024 - img.height * scale) / 2

          ctx.fillStyle = "#FFFFFF"
          ctx.fillRect(0, 0, 1024, 1024)
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale)

          canvas.toBlob((blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              })

              // Create preview URL
              const url = URL.createObjectURL(resizedFile)
              setPreviewUrl(url)

              // Set file in form
              form.setValue("designPlan", resizedFile, { shouldValidate: true })
            }
          }, file.type)
        }
      }

      img.src = URL.createObjectURL(file)
    } else {
      // For non-image files, just use the original
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      form.setValue("designPlan", file, { shouldValidate: true })
    }
  }

  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      try {
        // Validate JSON format
        JSON.parse(content)
        form.setValue("jsonData", content, { shouldValidate: true })
        setJsonParseError(null)
        setJsonParseSuccess(true)
      } catch (error) {
        setJsonParseError("Invalid JSON format. Please check your file.")
        setJsonParseSuccess(false)
      }
    }
    reader.readAsText(file)
  }

  const validateJsonInput = (jsonString: string) => {
    try {
      if (!jsonString.trim()) {
        setJsonParseError(null)
        setJsonParseSuccess(false)
        return
      }

      // Validate JSON format
      const parsedJson = JSON.parse(jsonString)

      // Check if it has the expected structure
      if (!parsedJson.plans || !Array.isArray(parsedJson.plans)) {
        setJsonParseError("JSON is valid but missing 'plans' array.")
        setJsonParseSuccess(false)
        return
      }

      // Check if it has furniture data
      const hasFurniture = parsedJson.plans.some(
        (plan: any) => plan.unreal_data && plan.unreal_data.furniture && Array.isArray(plan.unreal_data.furniture),
      )

      if (!hasFurniture) {
        setJsonParseError("JSON is valid but missing furniture data.")
        setJsonParseSuccess(false)
        return
      }

      setJsonParseError(null)
      setJsonParseSuccess(true)
    } catch (error) {
      setJsonParseError("Invalid JSON format. Please check your input.")
      setJsonParseSuccess(false)
    }
  }

  const onSubmit = (data: any) => {
    // Extract furniture data from JSON if available
    let objectsJSON = []
    if (data.jsonData) {
      try {
        const parsedJson = JSON.parse(data.jsonData)
        if (parsedJson.plans && Array.isArray(parsedJson.plans)) {
          // Find the first plan with furniture data
          const planWithFurniture = parsedJson.plans.find(
            (plan: any) => plan.unreal_data && plan.unreal_data.furniture && Array.isArray(plan.unreal_data.furniture),
          )

          if (planWithFurniture) {
            objectsJSON = planWithFurniture.unreal_data.furniture
          }
        }
      } catch (error) {
        console.error("Error parsing JSON:", error)
      }
    }

    updateFormData({
      designPlan: data.designPlan,
      dimensions: {
        value: data.dimensionValue,
        unit: data.dimensionUnit,
      },
      jsonData: data.jsonData,
      objectsJSON: objectsJSON,
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
                        ref={fileInputRef}
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
                      <div className="relative aspect-square w-full max-h-[300px] overflow-hidden rounded-md border">
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
                          src="/plan/2.jpg"
                          alt="Example bedroom plan 1"
                          width={600}
                          height={400}
                          className="w-full h-auto"
                        />
                        <div className="p-2 text-sm text-center">Example 1</div>
                      </div>
                      <div className="border rounded-md overflow-hidden">
                        <Image
                          src="/plan/1.jpg"
                          alt="Example bedroom plan 2"
                          width={300}
                          height={300}
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

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">JSON Configuration (Optional)</h2>
          <FormDescription>
            Upload or paste JSON data to initialize the design with predefined furniture boxes.
          </FormDescription>

          <Tabs defaultValue="upload" onValueChange={(value) => setActiveTab(value as "upload" | "json")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload JSON File</TabsTrigger>
              <TabsTrigger value="paste">Paste JSON Data</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                <Input
                  type="file"
                  accept=".json"
                  className="hidden"
                  id="json-file-upload"
                  onChange={handleJsonFileUpload}
                />
                <Label htmlFor="json-file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <FileJson className="h-8 w-8 text-muted-foreground" />
                  <span className="text-muted-foreground font-medium">Click to upload JSON file</span>
                </Label>
              </div>
              {jsonParseSuccess && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertTitle className="text-green-800">Success</AlertTitle>
                  <AlertDescription className="text-green-700">
                    JSON file successfully loaded and validated.
                  </AlertDescription>
                </Alert>
              )}
              {jsonParseError && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{jsonParseError}</AlertDescription>
                </Alert>
              )}
            </TabsContent>
            <TabsContent value="paste" className="space-y-4">
              <FormField
                control={form.control}
                name="jsonData"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your JSON data here..."
                        className="min-h-[200px] font-mono text-sm"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          validateJsonInput(e.target.value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {jsonParseSuccess && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertTitle className="text-green-800">Success</AlertTitle>
                  <AlertDescription className="text-green-700">JSON data successfully validated.</AlertDescription>
                </Alert>
              )}
              {jsonParseError && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{jsonParseError}</AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
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

