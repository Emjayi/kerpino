"use client"

import type React from "react"
import type { MouseEvent } from "react"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Upload, Trash2, Plus } from "lucide-react"
import Image from "next/image"

import type {
  ObjectItem,
  Resources,
  ImageDimensions,
  ObjectSelectionProps,
  ResourceItem,
  Position,
} from "@/lib/definitions"
import { OBJECT_TYPES, DEFAULT_OBJECTS_JSON, RESIZE_HANDLES } from "@/lib/constants/object-selection"
import { percentToPixels, pixelsToPercent } from "@/lib/utils/object-selection"

type ResizeHandle = "top-left" | "top" | "top-right" | "right" | "bottom-right" | "bottom" | "bottom-left" | "left"

export function ObjectSelectionAndResources({
  formData,
  updateFormData,
  onNext,
  onBack,
  objectsJSON = DEFAULT_OBJECTS_JSON,
}: ObjectSelectionProps) {
  // State for objects and resources
  const [selectedObjects, setSelectedObjects] = useState<ObjectItem[]>(formData.selectedObjects || [])
  const [resources, setResources] = useState<Resources>(formData.objectResources || {})
  const [customObjectType, setCustomObjectType] = useState<string>("")
  const [selectedBoxId, setSelectedBoxId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<"selection" | "resources">("selection")
  const [imageLoaded, setImageLoaded] = useState<boolean>(false)

  // Drawing state
  const [isDrawing, setIsDrawing] = useState<boolean>(false)
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null)

  // Refs for DOM elements and measurements
  const imageRef = useRef<HTMLImageElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const imageDimensionsRef = useRef<ImageDimensions>({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    naturalWidth: 0,
    naturalHeight: 0,
  })

  // Refs for drag and resize operations
  const isDraggingRef = useRef<boolean>(false)
  const isResizingRef = useRef<boolean>(false)
  const draggedBoxIdRef = useRef<number | null>(null)
  const resizedBoxIdRef = useRef<number | null>(null)
  const resizeHandleRef = useRef<ResizeHandle | null>(null)
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const startBoxDimensionsRef = useRef<Position>({ x: 0, y: 0, width: 0, height: 0 })
  const objectsRef = useRef<ObjectItem[]>(selectedObjects)

  // Memoize the preview URL to prevent regeneration on each render
  const previewUrl = useMemo(() => {
    return formData.designPlan ? URL.createObjectURL(formData.designPlan) : null
  }, [formData.designPlan])

  // Keep objectsRef in sync with selectedObjects
  useEffect(() => {
    objectsRef.current = selectedObjects
  }, [selectedObjects])

  // Initialize objects from JSON if selectedObjects is empty
  useEffect(() => {
    if (selectedObjects.length === 0 && objectsJSON.length > 0) {
      const initialObjects: ObjectItem[] = objectsJSON.map((obj) => ({
        id: obj.id,
        type: "", // Initially empty, to be selected by user
        position: {
          x: obj.x,
          y: obj.y,
          width: obj.width || 10,
          height: obj.height || 10,
        },
      }))
      setSelectedObjects(initialObjects)
    }
  }, [selectedObjects.length, objectsJSON])

  // Update image dimensions - using a callback to avoid recreating function
  const updateImageDimensions = useCallback(() => {
    if (!imageRef.current || !containerRef.current) return

    const img = imageRef.current
    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()
    const imgRect = img.getBoundingClientRect()

    // Store dimensions in ref to avoid state updates
    imageDimensionsRef.current = {
      width: imgRect.width,
      height: imgRect.height,
      top: imgRect.top - containerRect.top,
      left: imgRect.left - containerRect.left,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
    }
  }, [])

  // Set up resize listener
  useEffect(() => {
    const handleResize = () => {
      if (imageLoaded) {
        updateImageDimensions()
      }
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [imageLoaded, updateImageDimensions])

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  // Handle box click
  const handleBoxClick = (id: number, e: React.MouseEvent) => {
    if (isDraggingRef.current || isResizingRef.current) {
      e.stopPropagation()
      return
    }
    setSelectedBoxId(id)
  }

  // Handle object type change
  const handleObjectTypeChange = (type: string) => {
    if (selectedBoxId) {
      setSelectedObjects((objects) => objects.map((obj) => (obj.id === selectedBoxId ? { ...obj, type } : obj)))
      setSelectedBoxId(null)
    }
  }

  // Handle adding custom type
  const handleAddCustomType = () => {
    if (customObjectType.trim()) {
      handleObjectTypeChange(customObjectType.trim())
      setCustomObjectType("")
    }
  }

  // Handle adding new object
  const handleAddNewObject = () => {
    // Add a new object in the center of the image
    const newObject: ObjectItem = {
      id: Date.now(),
      type: "",
      position: {
        x: 50, // Center X (percentage)
        y: 50, // Center Y (percentage)
        width: 10, // Width (percentage)
        height: 10, // Height (percentage)
      },
    }
    setSelectedObjects((prev) => [...prev, newObject])
    setSelectedBoxId(newObject.id)
  }

  // Handle removing object
  const handleRemoveObject = (id: number) => {
    setSelectedObjects((prev) => prev.filter((obj) => obj.id !== id))
    if (selectedBoxId === id) {
      setSelectedBoxId(null)
    }

    // Also remove resources for this object
    const updatedResources = { ...resources }
    delete updatedResources[id.toString()]
    setResources(updatedResources)
  }

  // Drag start handler
  const handleDragStart = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    e.preventDefault()

    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      startPosRef.current = {
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top,
      }

      // Store the current box position
      const box = selectedObjects.find((obj) => obj.id === id)
      if (box) {
        startBoxDimensionsRef.current = { ...box.position }
      }
    }

    draggedBoxIdRef.current = id
    isDraggingRef.current = true

    document.addEventListener("mousemove", handleDragMove as unknown as EventListener)
    document.addEventListener("mouseup", handleDragEnd as EventListener)
  }

  // Drag move handler
  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || !draggedBoxIdRef.current || !containerRef.current) return

    e.preventDefault()

    const containerRect = containerRef.current.getBoundingClientRect()
    const currentX = e.clientX - containerRect.left
    const currentY = e.clientY - containerRect.top

    const deltaX = currentX - startPosRef.current.x
    const deltaY = currentY - startPosRef.current.y

    // Update objects in ref first to avoid re-renders
    const updatedObjects = objectsRef.current.map((obj) => {
      if (obj.id === draggedBoxIdRef.current) {
        // Get the original position in pixels
        const pixelPos = percentToPixels(startBoxDimensionsRef.current, imageDimensionsRef.current)

        // Calculate new position in pixels
        const newPixelX = pixelPos.x + deltaX
        const newPixelY = pixelPos.y + deltaY

        // Convert back to percentages
        const { width: imgWidth, height: imgHeight } = imageDimensionsRef.current
        const newPercentX = (newPixelX / imgWidth) * 100
        const newPercentY = (newPixelY / imgHeight) * 100

        // Ensure the box stays within the image bounds (0-100%)
        const boundedX = Math.max(obj.position.width / 2, Math.min(100 - obj.position.width / 2, newPercentX))
        const boundedY = Math.max(obj.position.height / 2, Math.min(100 - obj.position.height / 2, newPercentY))

        return {
          ...obj,
          position: {
            ...obj.position,
            x: boundedX,
            y: boundedY,
          },
        }
      }
      return obj
    })

    objectsRef.current = updatedObjects
    setSelectedObjects([...updatedObjects])
  }, [])

  // Drag end handler
  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false
    draggedBoxIdRef.current = null

    // Ensure final state is updated
    setSelectedObjects([...objectsRef.current])

    document.removeEventListener("mousemove", handleDragMove as unknown as EventListener)
    document.removeEventListener("mouseup", handleDragEnd)
  }, [handleDragMove])

  // Resize start handler
  const handleResizeStart = (e: React.MouseEvent, id: number, handle: ResizeHandle) => {
    e.stopPropagation()
    e.preventDefault()

    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      startPosRef.current = {
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top,
      }

      // Store the current box dimensions
      const box = selectedObjects.find((obj) => obj.id === id)
      if (box) {
        startBoxDimensionsRef.current = { ...box.position }
      }
    }

    resizedBoxIdRef.current = id
    resizeHandleRef.current = handle
    isResizingRef.current = true

    document.addEventListener("mousemove", handleResizeMove as unknown as EventListener)
    document.addEventListener("mouseup", handleResizeEnd)
  }

  // Resize move handler
  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizingRef.current || !resizedBoxIdRef.current || !containerRef.current || !resizeHandleRef.current) return

    e.preventDefault()

    const containerRect = containerRef.current.getBoundingClientRect()
    const currentX = e.clientX - containerRect.left
    const currentY = e.clientY - containerRect.top

    const deltaX = currentX - startPosRef.current.x
    const deltaY = currentY - startPosRef.current.y

    // Update objects in ref first to avoid re-renders
    const updatedObjects = objectsRef.current.map((obj) => {
      if (obj.id === resizedBoxIdRef.current) {
        // Get the original position in pixels
        const pixelPos = percentToPixels(startBoxDimensionsRef.current, imageDimensionsRef.current)
        const { x, y, width, height } = pixelPos

        let newX = x
        let newY = y
        let newWidth = width
        let newHeight = height

        // Apply resize based on which handle was dragged
        const handle = resizeHandleRef.current

        // Handle each resize direction
        switch (handle) {
          case "left":
            newX = x + deltaX
            newWidth = width - deltaX
            break
          case "right":
            newWidth = width + deltaX
            break
          case "top":
            newY = y + deltaY
            newHeight = height - deltaY
            break
          case "bottom":
            newHeight = height + deltaY
            break
          case "top-left":
            newX = x + deltaX
            newY = y + deltaY
            newWidth = width - deltaX
            newHeight = height - deltaY
            break
          case "top-right":
            newY = y + deltaY
            newWidth = width + deltaX
            newHeight = height - deltaY
            break
          case "bottom-left":
            newX = x + deltaX
            newWidth = width - deltaX
            newHeight = height + deltaY
            break
          case "bottom-right":
            newWidth = width + deltaX
            newHeight = height + deltaY
            break
        }

        // Ensure minimum size (in pixels)
        const MIN_SIZE_PX = 20
        if (newWidth < MIN_SIZE_PX) {
          if (handle?.includes("left")) {
            newX = x + width - MIN_SIZE_PX
          }
          newWidth = MIN_SIZE_PX
        }

        if (newHeight < MIN_SIZE_PX) {
          if (handle?.includes("top")) {
            newY = y + height - MIN_SIZE_PX
          }
          newHeight = MIN_SIZE_PX
        }

        // Convert back to percentages
        const { width: imgWidth, height: imgHeight } = imageDimensionsRef.current
        const newPercentX = (newX / imgWidth) * 100
        const newPercentY = (newY / imgHeight) * 100
        const newPercentWidth = (newWidth / imgWidth) * 100
        const newPercentHeight = (newHeight / imgHeight) * 100

        // Ensure box stays within image bounds (0-100%)
        const boundedX = Math.max(newPercentWidth / 2, Math.min(100 - newPercentWidth / 2, newPercentX))
        const boundedY = Math.max(newPercentHeight / 2, Math.min(100 - newPercentHeight / 2, newPercentY))

        return {
          ...obj,
          position: {
            x: boundedX,
            y: boundedY,
            width: newPercentWidth,
            height: newPercentHeight,
          },
        }
      }
      return obj
    })

    objectsRef.current = updatedObjects
    setSelectedObjects([...updatedObjects])
  }, [])

  // Resize end handler
  const handleResizeEnd = useCallback(() => {
    isResizingRef.current = false
    resizedBoxIdRef.current = null
    resizeHandleRef.current = null

    // Ensure final state is updated
    setSelectedObjects([...objectsRef.current])

    document.removeEventListener("mousemove", handleResizeMove as unknown as EventListener)
    document.removeEventListener("mouseup", handleResizeEnd)
  }, [handleResizeMove])

  // Drawing handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (selectedBoxId || isDraggingRef.current || isResizingRef.current) return

    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - containerRect.left
      const y = e.clientY - containerRect.top

      setIsDrawing(true)
      setStartPoint({ x, y })
      setCurrentPoint({ x, y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - containerRect.left
    const y = e.clientY - containerRect.top

    setCurrentPoint({ x, y })
  }

  const handleMouseUp = () => {
    if (!isDrawing || !startPoint || !currentPoint) {
      setIsDrawing(false)
      return
    }

    // Calculate rectangle dimensions in pixels
    const left = Math.min(startPoint.x, currentPoint.x)
    const top = Math.min(startPoint.y, currentPoint.y)
    const width = Math.abs(currentPoint.x - startPoint.x)
    const height = Math.abs(currentPoint.y - startPoint.y)

    // Only create a box if it's big enough
    if (width > 10 && height > 10) {
      const centerX = left + width / 2
      const centerY = top + height / 2

      // Convert to percentages by passing individual arguments
      const percentPosition = pixelsToPercent(centerX, centerY, width, height, imageDimensionsRef.current)

      const newObject: ObjectItem = {
        id: Date.now(),
        type: "",
        position: percentPosition,
      }

      setSelectedObjects((prev) => [...prev, newObject])
      setSelectedBoxId(newObject.id)
    }

    setIsDrawing(false)
    setStartPoint(null)
    setCurrentPoint(null)
  }

  // Handle resource change
  const handleResourceChange = (objectId: number, index: number, field: keyof ResourceItem, value: string) => {
    setResources((prev) => ({
      ...prev,
      [objectId]: {
        ...(prev[objectId] || {}),
        [index]: {
          ...(prev[objectId]?.[index] || {}),
          [field]: value,
        },
      },
    }))
  }

  // Handle file change
  const handleFileChange = (objectId: number, index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          handleResourceChange(objectId, index, "photo", reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle form submission
  const handleSubmit = () => {
    updateFormData({ selectedObjects, objectResources: resources })
    onNext()
  }

  // Handle image load
  const handleImageLoad = () => {
    updateImageDimensions()
    setImageLoaded(true)
  }

  // Get box style based on percentage coordinates
  const getBoxStyle = (obj: ObjectItem, imageDimensions: ImageDimensions): React.CSSProperties => {
    const { width, height } = imageDimensions

    // Convert percentages to pixels for display
    const pixelX = (obj.position.x / 100) * width
    const pixelY = (obj.position.y / 100) * height
    const pixelWidth = (obj.position.width / 100) * width
    const pixelHeight = (obj.position.height / 100) * height

    return {
      left: `${pixelX}px`,
      top: `${pixelY}px`,
      width: `${pixelWidth}px`,
      height: `${pixelHeight}px`,
      transform: "translate(-50%, -50%)",
    }
  }

  // Get resize handle style
  const getHandleStyle = (position: ResizeHandle): React.CSSProperties => {
    const styles: Record<ResizeHandle, React.CSSProperties> = {
      "top-left": { top: 0, left: 0, transform: "translate(-50%, -50%)" },
      top: { top: 0, left: "50%", transform: "translate(-50%, -50%)" },
      "top-right": { top: 0, right: 0, transform: "translate(50%, -50%)" },
      right: { top: "50%", right: 0, transform: "translate(50%, -50%)" },
      "bottom-right": { bottom: 0, right: 0, transform: "translate(50%, 50%)" },
      bottom: { bottom: 0, left: "50%", transform: "translate(-50%, 50%)" },
      "bottom-left": { bottom: 0, left: 0, transform: "translate(-50%, 50%)" },
      left: { top: "50%", left: 0, transform: "translate(-50%, -50%)" },
    }

    return styles[position]
  }

  // Get drawing rectangle style
  const getDrawingRectStyle = (): React.CSSProperties | null => {
    if (!isDrawing || !startPoint || !currentPoint) return null

    const left = Math.min(startPoint.x, currentPoint.x)
    const top = Math.min(startPoint.y, currentPoint.y)
    const width = Math.abs(currentPoint.x - startPoint.x)
    const height = Math.abs(currentPoint.y - startPoint.y)

    return {
      position: "absolute",
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
      border: "2px dashed #3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      pointerEvents: "none",
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex space-x-2 border-b">
        <Button
          variant={activeTab === "selection" ? "default" : "ghost"}
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          data-state={activeTab === "selection" ? "active" : "inactive"}
          onClick={() => setActiveTab("selection")}
        >
          Object Selection
        </Button>
        <Button
          variant={activeTab === "resources" ? "default" : "ghost"}
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          data-state={activeTab === "resources" ? "active" : "inactive"}
          onClick={() => setActiveTab("resources")}
          disabled={selectedObjects.filter((obj) => obj.type).length === 0}
        >
          Object Resources
        </Button>
      </div>

      {activeTab === "selection" && (
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Select Objects in Your Plan</h2>
            <p className="text-muted-foreground">
              Click and drag on the image to draw boxes around objects. Then select what type of object each one
              represents. You can also drag boxes to reposition them and resize using the handles on the edges.
            </p>

            <div
              className="flex flex-col relative border rounded-lg overflow-hidden"
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => {
                if (isDrawing) {
                  setIsDrawing(false)
                  setStartPoint(null)
                  setCurrentPoint(null)
                }
              }}
            >
              <div className="aspect-video">
                <div className="">
                  <Image
                    ref={imageRef}
                    key={previewUrl}
                    src={previewUrl || "/placeholder.svg?height=400&width=600"}
                    alt="Your bedroom plan"
                    fill
                    className="object-contain select-none"
                    crossOrigin="anonymous"
                    onLoad={handleImageLoad}
                    priority
                  />

                  {/* Drawing rectangle */}
                  {isDrawing && getDrawingRectStyle() && <div style={getDrawingRectStyle() || {}} />}

                  {/* Selectable boxes - only render when image is loaded */}
                  {imageLoaded &&
                    selectedObjects.map((obj) => (
                      <div
                        key={obj.id}
                        className={`absolute border-2 cursor-move transition-colors ${selectedBoxId === obj.id
                            ? "border-yellow-500 bg-yellow-500/30"
                            : obj.type
                              ? "border-green-500 bg-green-500/20"
                              : "border-red-500 bg-red-500/20"
                          }`}
                        style={getBoxStyle(obj, imageDimensionsRef.current)}
                        onClick={(e) => handleBoxClick(obj.id, e)}
                        onMouseDown={(e) => handleDragStart(e, obj.id)}
                      >
                        {/* Resize handles */}
                        {RESIZE_HANDLES.map((handle) => (
                          <div
                            key={handle.position}
                            className={`absolute w-3 h-3 bg-white border-2 border-gray-400 rounded-full z-10`}
                            style={{
                              ...getHandleStyle(handle.position),
                              cursor: handle.cursor,
                            }}
                            onMouseDown={(e) => handleResizeStart(e, obj.id, handle.position)}
                          />
                        ))}

                        {obj.type && (
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-background px-2 py-1 rounded text-xs font-medium shadow">
                            {obj.type}
                          </div>
                        )}
                      </div>
                    ))}
                </div>

                {/* Add new object button - only show when image is loaded */}
                {imageLoaded && (
                  <Button className="absolute bottom-4 right-4" size="sm" onClick={handleAddNewObject}>
                    <Plus className="mr-2 h-4 w-4" /> Add Object
                  </Button>
                )}
              </div>
            </div>

            {/* Object type selection */}
            {selectedBoxId && (
              <div className="p-4 border rounded-md bg-muted/50">
                <h3 className="font-medium mb-2">Select object type for highlighted box:</h3>
                <div className="flex gap-2 flex-wrap">
                  <Select onValueChange={handleObjectTypeChange}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select object type" />
                    </SelectTrigger>
                    <SelectContent>
                      {OBJECT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="flex items-center">or</span>
                  <div className="flex gap-2 flex-1">
                    <Input
                      placeholder="Custom object type"
                      value={customObjectType}
                      onChange={(e) => setCustomObjectType(e.target.value)}
                    />
                    <Button onClick={handleAddCustomType}>Add</Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Selected Objects</h2>

            {selectedObjects.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Object Type</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedObjects.map((obj) => (
                    <TableRow key={obj.id} className={selectedBoxId === obj.id ? "bg-muted" : ""}>
                      <TableCell>
                        <Badge variant="outline">{obj.id}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {obj.type ? obj.type.replace("_", " ") : <span className="text-yellow-600">Not selected</span>}
                      </TableCell>
                      <TableCell>{`X: ${Math.round(obj.position.x)}%, Y: ${Math.round(obj.position.y)}%`}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveObject(obj.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="border rounded-lg p-4 text-center text-muted-foreground">
                No objects detected. Click and drag on the image to add objects.
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button
              onClick={() => {
                if (selectedObjects.some((obj) => obj.type)) {
                  setActiveTab("resources")
                } else {
                  handleSubmit()
                }
              }}
              disabled={selectedObjects.length > 0 && selectedObjects.every((obj) => !obj.type)}
            >
              {selectedObjects.some((obj) => obj.type) ? "Continue to Resources" : "Skip Resources"}
            </Button>
          </div>
        </div>
      )}

      {activeTab === "resources" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Upload Object Resources</h2>
          <p className="text-muted-foreground">
            Please upload a photo and provide a link for 3 desired options for each selected object.
          </p>

          {selectedObjects
            .filter((obj) => obj.type)
            .map((object) => (
              <Card key={object.id} className="p-4">
                <h3 className="text-xl font-semibold mb-4">{object.type}</h3>
                {[0, 1, 2].map((index) => (
                  <div key={index} className="mb-4 p-4 border rounded-md">
                    <h4 className="text-lg font-medium mb-2">Option {index + 1}</h4>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`${object.id}-${index}-photo`}>Photo</Label>
                        <div className="mt-1 flex items-center">
                          <Input
                            id={`${object.id}-${index}-photo`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(object.id, index, e)}
                            className="hidden"
                          />
                          <Label
                            htmlFor={`${object.id}-${index}-photo`}
                            className="cursor-pointer flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg"
                          >
                            {resources[object.id]?.[index]?.photo ? (
                              <Image
                                src={resources[object.id][index].photo || "/placeholder.svg?height=128&width=128"}
                                alt={`${object.type} option ${index + 1}`}
                                width={128}
                                height={128}
                                className="object-cover rounded-lg"
                              />
                            ) : (
                              <Upload className="w-8 h-8 text-gray-400" />
                            )}
                          </Label>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`${object.id}-${index}-link`}>Link</Label>
                        <Input
                          id={`${object.id}-${index}-link`}
                          type="url"
                          placeholder="https://example.com"
                          value={resources[object.id]?.[index]?.link || ""}
                          onChange={(e) => handleResourceChange(object.id, index, "link", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </Card>
            ))}

          <div className="flex justify-between">
            <Button onClick={() => setActiveTab("selection")} variant="outline">
              Back to Selection
            </Button>
            <Button onClick={handleSubmit}>Next</Button>
          </div>
        </div>
      )}
    </div>
  )
}

