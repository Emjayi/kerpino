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
import { Upload, Info, FileJson, ArrowRight, Ruler } from "lucide-react"
import Image from "next/image"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const formSchema = z
  .object({
    designPlan: z
      .any()
      .optional()
      .refine((file) => file !== null, "Bedroom plan is required"),
    dimensionUnit: z.enum(["feet", "meters"], {
      required_error: "Please select a unit",
    }),
    // Metric dimensions
    widthMeters: z.string().optional(),
    heightMeters: z.string().optional(),
    // Imperial dimensions
    widthFeet: z.string().optional(),
    widthInches: z.string().optional(),
    heightFeet: z.string().optional(),
    heightInches: z.string().optional(),
    jsonData: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.dimensionUnit === "meters") {
        return data.widthMeters && data.heightMeters
      } else {
        return data.widthFeet && data.heightFeet
      }
    },
    {
      message: "Dimensions are required",
      path: ["dimensions"],
    },
  )

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
      dimensionUnit: formData.dimensions?.unit || "meters",
      // Metric dimensions
      widthMeters: formData.dimensions?.widthMeters || "",
      heightMeters: formData.dimensions?.heightMeters || "",
      // Imperial dimensions
      widthFeet: formData.dimensions?.widthFeet || "",
      widthInches: formData.dimensions?.widthInches || "0",
      heightFeet: formData.dimensions?.heightFeet || "",
      heightInches: formData.dimensions?.heightInches || "0",
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
        unit: data.dimensionUnit,
        // Include all dimension values
        widthMeters: data.widthMeters,
        heightMeters: data.heightMeters,
        widthFeet: data.widthFeet,
        widthInches: data.widthInches,
        heightFeet: data.heightFeet,
        heightInches: data.heightInches,
      },
      jsonData: data.jsonData,
      objectsJSON: objectsJSON,
    })
    onNext()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Upload Bedroom Plan</h2>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>Upload a clear image of your bedroom layout to get started.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <FormField
                control={form.control}
                name="designPlan"
                render={({ field }) => (
                  <FormItem>
                    <FormDescription className="text-sm">
                      Please upload your bedroom plan. Accepted formats: JPG, PNG, PDF (max 5MB)
                    </FormDescription>
                    <FormControl>
                      <div className="grid gap-4">
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                          <Input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="hidden"
                            id="design-plan-upload"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                          />
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <span className="text-muted-foreground font-medium">
                              {previewUrl ? "Change file" : "Click to upload or drag and drop"}
                            </span>
                            <span className="text-xs text-muted-foreground">JPG, PNG, PDF (max 5MB)</span>
                          </div>
                        </div>

                        {previewUrl && (
                          <div className="relative aspect-square w-full max-h-[300px] overflow-hidden rounded-md border">
                            <Image src={previewUrl || ""} alt="Bedroom plan preview" fill className="object-contain" />
                          </div>
                        )}

                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Info className="h-4 w-4 mt-0.5 shrink-0" />
                          <p>
                            Your bedroom plan should clearly show the layout of the room. See examples below for
                            reference.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="border sm:col-span-2 rounded-md overflow-hidden">
                            <Image
                              src="/plan/e2.jpg"
                              alt="Example bedroom plan 1"
                              width={600}
                              height={400}
                              className="w-full h-auto"
                            />
                            <div className="p-2 text-sm text-center">Example 1</div>
                          </div>
                          <div className="border rounded-md overflow-hidden">
                            <Image
                              src="/plan/e1.jpg"
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
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Room Dimensions</h2>
                <Ruler className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="dimensionUnit"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-medium">Measurement Unit</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="meters" id="meters" />
                            <Label htmlFor="meters" className="font-normal cursor-pointer">
                              Meters
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="feet" id="feet" />
                            <Label htmlFor="feet" className="font-normal cursor-pointer">
                              Imperial (feet & inches)
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-muted/40 p-4 rounded-lg border">
                  {form.watch("dimensionUnit") === "meters" ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-medium">Enter Room Dimensions (meters)</h3>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Enter the width and length of your room in meters.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="widthMeters"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center gap-2">
                                <FormLabel className="text-sm font-medium min-w-[80px]">Width</FormLabel>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <FormControl>
                                <div className="flex items-center">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    {...field}
                                    className="text-right"
                                  />
                                  <span className="ml-2 text-sm font-medium text-muted-foreground">m</span>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="heightMeters"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center gap-2">
                                <FormLabel className="text-sm font-medium min-w-[80px]">Length</FormLabel>
                                <ArrowRight className="h-4 w-4 rotate-90 text-muted-foreground" />
                              </div>
                              <FormControl>
                                <div className="flex items-center">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    {...field}
                                    className="text-right"
                                  />
                                  <span className="ml-2 text-sm font-medium text-muted-foreground">m</span>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-medium">Enter Room Dimensions (feet & inches)</h3>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Enter the width and length of your room in feet and inches.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-sm font-medium">Width</h4>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="widthFeet"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs text-muted-foreground">Feet</FormLabel>
                                  <FormControl>
                                    <div className="flex items-center">
                                      <Input type="number" min="0" placeholder="0" {...field} className="text-right" />
                                      <span className="ml-2 text-sm font-medium text-muted-foreground">ft</span>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="widthInches"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs text-muted-foreground">Inches</FormLabel>
                                  <FormControl>
                                    <div className="flex items-center">
                                      <Input
                                        type="number"
                                        min="0"
                                        max="11"
                                        placeholder="0"
                                        {...field}
                                        className="text-right"
                                      />
                                      <span className="ml-2 text-sm font-medium text-muted-foreground">in</span>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-sm font-medium">Length</h4>
                            <ArrowRight className="h-4 w-4 rotate-90 text-muted-foreground" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="heightFeet"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs text-muted-foreground">Feet</FormLabel>
                                  <FormControl>
                                    <div className="flex items-center">
                                      <Input type="number" min="0" placeholder="0" {...field} className="text-right" />
                                      <span className="ml-2 text-sm font-medium text-muted-foreground">ft</span>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="heightInches"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs text-muted-foreground">Inches</FormLabel>
                                  <FormControl>
                                    <div className="flex items-center">
                                      <Input
                                        type="number"
                                        min="0"
                                        max="11"
                                        placeholder="0"
                                        {...field}
                                        className="text-right"
                                      />
                                      <span className="ml-2 text-sm font-medium text-muted-foreground">in</span>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">JSON Configuration</h2>
                <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">Optional</span>
              </div>
              <FormDescription>
                Upload or paste JSON data to initialize the design with predefined furniture boxes.
              </FormDescription>

              <Tabs defaultValue="upload" onValueChange={(value) => setActiveTab(value as "upload" | "json")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Upload JSON File</TabsTrigger>
                  <TabsTrigger value="paste">Paste JSON Data</TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="space-y-4 pt-4">
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
                <TabsContent value="paste" className="space-y-4 pt-4">
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
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={previewUrl === null} className="px-8">
            Continue
          </Button>
        </div>
      </form>
    </Form>
  )
}
