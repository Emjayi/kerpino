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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Upload, Trash2, Check, X } from "lucide-react"
import Image from "next/image"

import type {
  ObjectItem,
  Resources,
  ImageDimensions,
  ObjectSelectionProps,
  ResourceItem,
  Position,
  FurnitureItem,
} from "@/lib/definitions"

import { OBJECT_TYPES, RESIZE_HANDLES } from "@/lib/constants/object-selection"
import { percentToPixels, downloadJSON } from "@/lib/utils/object-selection"

// Extend the ObjectItem type to include angle
declare module "@/lib/definitions" {
  interface ObjectItem {
    angle?: number
    rotation?: number
    category?: string
    ai_label?: string
    bbox_corners_px?: number[][]
  }
}

export function ObjectSelectionAndResources({ formData, updateFormData, onNext, onBack }: ObjectSelectionProps) {
  // Extract objectsJSON from formData
  const objectsJSON = formData.objectsJSON || []
  const planMetadata = (formData.planMetadata) || null

  // State for objects and resources
  const [selectedObjects, setSelectedObjects] = useState<ObjectItem[]>(formData.selectedObjects || [])
  const [resources, setResources] = useState<Resources>(formData.objectResources || {})
  const [customObjectType, setCustomObjectType] = useState<string>("")
  const [selectedBoxId, setSelectedBoxId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<"selection" | "resources">("selection")
  const [imageLoaded, setImageLoaded] = useState<boolean>(false)
  const [furnitureData, setFurnitureData] = useState<FurnitureItem[]>([])
  const [nextUserFurnitureId, setNextUserFurnitureId] = useState<number>(objectsJSON.length + 1)
  const [selectionInterfacePosition, setSelectionInterfacePosition] = useState<{
    x: number
    y: number
  } | null>(null)

  // Drawing state
  const [isDrawing, setIsDrawing] = useState<boolean>(false)
  const [drawingStep, setDrawingStep] = useState<1 | 2 | 3>(1) // 1 = first click (start), 2 = second click (line), 3 = third click (box)
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null)
  const [lineEndPoint, setLineEndPoint] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [lastClickPosition, setLastClickPosition] = useState<{ x: number; y: number } | null>(null)
  const [drawingInstructions, setDrawingInstructions] = useState<string>("")

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
  const resizeHandleRef = useRef<string | null>(null)
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
    // First check if we have plan metadata with furniture
    if (selectedObjects.length === 0 && planMetadata && planMetadata.plans && planMetadata.plans.length > 0) {
      const plan = planMetadata.plans[0]
      if (plan.unreal_data && plan.unreal_data.furniture && plan.unreal_data.furniture.length > 0) {
        const furniture = plan.unreal_data.furniture

        // Convert furniture data to our object format
        const initialObjects: ObjectItem[] = furniture.map((item: { bbox_corners_px: any; center_px: any[]; ai_label: string; category: any; user_label: any; rotation: number }, index: number) => {
          // Calculate bounding box dimensions
          const corners = item.bbox_corners_px
          const minX = Math.min(...corners.map((corner: number[]) => corner[0]))
          const minY = Math.min(...corners.map((corner: number[]) => corner[1]))
          const maxX = Math.max(...corners.map((corner: number[]) => corner[0]))
          const maxY = Math.max(...corners.map((corner: number[]) => corner[1]))

          // Calculate center, width, and height
          const centerX = item.center_px[0]
          const centerY = item.center_px[1]
          const width = maxX - minX
          const height = maxY - minY

          // Convert to percentages based on image dimensions
          const imgWidth = plan.revit_data.pixel_dimensions.width
          const imgHeight = plan.revit_data.pixel_dimensions.height

          const percentX = (centerX / imgWidth) * 100
          const percentY = (centerY / imgHeight) * 100
          const percentWidth = (width / imgWidth) * 100
          const percentHeight = (height / imgHeight) * 100

          // Extract ID from ai_label
          const idMatch = item.ai_label.match(/\d+/)
          const numericId = idMatch ? Number.parseInt(idMatch[0]) : index + 1

          return {
            id: numericId,
            type: item.category || "",
            position: {
              x: percentX,
              y: percentY,
              width: percentWidth,
              height: percentHeight,
            },
            bbox_px: {
              min: [minX, minY],
              max: [maxX, maxY],
            },
            ai_guess: item.category || "",
            verified: !!item.user_label,
            original_id: item.ai_label,
            rotation: item.rotation,
            category: item.category,
            ai_label: item.ai_label,
            bbox_corners_px: item.bbox_corners_px,
            angle: (item.rotation * Math.PI) / 180, // Convert degrees to radians
          }
        })

        setSelectedObjects(initialObjects)

        // Find the highest ID to set the next ID counter
        const highestId = Math.max(...initialObjects.map((obj) => obj.id))
        setNextUserFurnitureId(highestId + 1)
      }
    }
    // Fallback to the original JSON parsing if no plan metadata
    else if (selectedObjects.length === 0 && objectsJSON.length > 0) {
      // Parse the JSON data to extract furniture items with bounding boxes
      const parsedFurniture = objectsJSON
        .map((item: any, index: number) => {
          // Check if this is from the plans → unreal_data → furniture section
          if (item.bbox_px && item.bbox_px.max && item.bbox_px.min) {
            return {
              id: item.id || `furniture_${index}`,
              ai_guess: item.ai_guess || "",
              bbox_px: {
                max: [...item.bbox_px.max], // Create a copy to avoid reference issues
                min: [...item.bbox_px.min], // Create a copy to avoid reference issues
              },
              verified: false,
              label: item.user_label || "",
              furniture_type: item.furniture_type || "",
            }
          }
          return null
        })
        .filter(Boolean) as FurnitureItem[]

      setFurnitureData(parsedFurniture)

      // Convert bounding boxes to our object format
      const initialObjects: ObjectItem[] = parsedFurniture.map((furniture, index) => {
        // Extract numeric ID from furniture ID string
        const idMatch = furniture.id.toString().match(/\d+/)
        const numericId = idMatch ? Number.parseInt(idMatch[0]) : index + 1

        return {
          id: numericId,
          type: furniture.furniture_type || "",
          position: {
            x: 0, // Will be calculated when image loads
            y: 0, // Will be calculated when image loads
            width: 0, // Will be calculated when image loads
            height: 0, // Will be calculated when image loads
          },
          bbox_px: {
            max: [...furniture.bbox_px.max], // Create a copy to avoid reference issues
            min: [...furniture.bbox_px.min], // Create a copy to avoid reference issues
          },
          ai_guess: furniture.ai_guess || "",
          verified: furniture.verified || false,
          original_id: furniture.id.toString(),
          original_bbox_px: {
            max: [...furniture.bbox_px.max], // Store the original bbox for reference
            min: [...furniture.bbox_px.min], // Store the original bbox for reference
          },
        }
      })

      setSelectedObjects(initialObjects)

      // Find the highest user furniture ID to set the next ID counter
      const userIds = initialObjects
        .map((obj) => obj.id.toString())
        .filter((id) => id.startsWith("furniture_"))
        .map((id) => Number.parseInt(id.replace("furniture_", "")))

      if (userIds.length > 0) {
        setNextUserFurnitureId(Math.max(...userIds) + 1)
      }
    }
  }, [selectedObjects.length, objectsJSON, planMetadata])

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

    // Update object positions based on bounding boxes once image is loaded
    if (selectedObjects.length > 0 && selectedObjects[0].bbox_px) {
      const updatedObjects = selectedObjects.map((obj) => {
        if (obj.bbox_px) {
          // Use the original bbox_px if available, otherwise use the current one
          const bbox = obj.original_bbox_px || obj.bbox_px

          const centerX = (bbox.max[0] + bbox.min[0]) / 2
          const centerY = (bbox.max[1] + bbox.min[1]) / 2
          const width = Math.abs(bbox.max[0] - bbox.min[0])
          const height = Math.abs(bbox.max[1] - bbox.min[1])

          // Convert to percentages
          const percentX = (centerX / img.naturalWidth) * 100
          const percentY = (centerY / img.naturalHeight) * 100
          const percentWidth = (width / img.naturalWidth) * 100
          const percentHeight = (height / img.naturalHeight) * 100

          return {
            ...obj,
            position: {
              x: percentX,
              y: percentY,
              width: percentWidth,
              height: percentHeight,
            },
          }
        }
        return obj
      })

      setSelectedObjects(updatedObjects)
    }
  }, [selectedObjects])

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

  // Update drawing instructions based on drawing step
  useEffect(() => {
    if (isDrawing) {
      if (drawingStep === 2) {
        setDrawingInstructions("Click again to set the direction of the object")
      } else if (drawingStep === 3) {
        setDrawingInstructions("Click a third time to create the object on one side of the line")
      }
    } else {
      setDrawingInstructions(
        "Click once to set the starting point, then click again to draw a line, and a third time to create the object.",
      )
    }
  }, [drawingStep, isDrawing])

  // Handle box click
  const handleBoxClick = (id: number, e: React.MouseEvent) => {
    if (isDraggingRef.current || isResizingRef.current) {
      e.stopPropagation()
      return
    }

    // Set the position for the selection interface next to the cursor
    setSelectionInterfacePosition({
      x: e.clientX,
      y: e.clientY,
    })

    setSelectedBoxId(id)
  }

  // Handle object type change
  const handleObjectTypeChange = (id: number, type: string) => {
    setSelectedObjects((objects) => objects.map((obj) => (obj.id === id ? { ...obj, type, verified: true } : obj)))
    // Clear the selection interface position to hide it
    setSelectionInterfacePosition(null)
    setSelectedBoxId(null)

    // Continue drawing process immediately
    setDrawingStep(1)
  }

  // Handle AI guess verification
  const handleVerifyAiGuess = (id: number, accept: boolean) => {
    setSelectedObjects((objects) =>
      objects.map((obj) => {
        if (obj.id === id) {
          if (accept) {
            // Accept the AI guess
            return { ...obj, type: obj.ai_guess || "", verified: true }
          } else {
            // Reject the AI guess, keep the box selected for manual selection
            return { ...obj, verified: false }
          }
        }
        return obj
      }),
    )

    // If accepting AI guess, hide the interface
    if (accept) {
      setSelectionInterfacePosition(null)
      setSelectedBoxId(null)

      // Continue drawing process immediately
      setDrawingStep(1)
    }
  }

  // Handle adding custom type
  const handleAddCustomType = (id: number) => {
    if (customObjectType.trim()) {
      handleObjectTypeChange(id, customObjectType.trim())
      setCustomObjectType("")
    }
  }

  // Handle adding new object
  const handleAddNewObject = () => {
    // Add a new object in the center of the image
    const newId = nextUserFurnitureId
    setNextUserFurnitureId((prev) => prev + 1)

    const newObject: ObjectItem = {
      id: newId,
      type: "",
      position: {
        x: 50, // Center X (percentage)
        y: 50, // Center Y (percentage)
        width: 10, // Width (percentage)
        height: 10, // Height (percentage)
      },
      ai_guess: "",
      verified: false,
      user_created: true,
      original_id: `furniture_${newId}`,
    }
    setSelectedObjects((prev) => [...prev, newObject])
  }

  // Handle removing object
  const handleRemoveObject = (id: number) => {
    setSelectedObjects((prev) => prev.filter((obj) => obj.id !== id))
    if (selectedBoxId === id) {
      setSelectedBoxId(null)
      setSelectionInterfacePosition(null)
    }

    // Also remove resources for this object
    const updatedResources = { ...resources }
    delete updatedResources[id.toString()]
    setResources(updatedResources)

    // Continue drawing process immediately
    setDrawingStep(1)
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

        // Update bbox_px if it exists
        let updatedBbox = obj.bbox_px
        if (updatedBbox) {
          const widthPx = Math.abs(updatedBbox.max[0] - updatedBbox.min[0])
          const heightPx = Math.abs(updatedBbox.max[1] - updatedBbox.min[1])

          // Calculate new center in pixels
          const newCenterX = (boundedX / 100) * imageRef.current!.naturalWidth
          const newCenterY = (boundedY / 100) * imageRef.current!.naturalHeight

          // Update bbox_px based on new center with CORRECTED min/max
          updatedBbox = {
            min: [newCenterX - widthPx / 2, newCenterY - heightPx / 2],
            max: [newCenterX + widthPx / 2, newCenterY + heightPx / 2],
          }
        }

        return {
          ...obj,
          position: {
            ...obj.position,
            x: boundedX,
            y: boundedY,
          },
          bbox_px: updatedBbox,
          has_been_modified: true,
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

    // Mark the object as modified
    if (draggedBoxIdRef.current !== null) {
      setSelectedObjects((prev) =>
        prev.map((obj) => (obj.id === draggedBoxIdRef.current ? { ...obj, has_been_modified: true } : obj)),
      )
    }

    draggedBoxIdRef.current = null
    document.removeEventListener("mousemove", handleDragMove as unknown as EventListener)
    document.removeEventListener("mouseup", handleDragEnd)
  }, [handleDragMove])

  // Resize start handler
  const handleResizeStart = (e: React.MouseEvent, id: number, handle: string) => {
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

        // Handle each resize direction - only move the specified border
        switch (handle) {
          case "left":
            newX = x + deltaX
            newWidth = width - deltaX
            break
          case "right":
            newWidth = width + deltaX
            // Don't change newX
            break
          case "top":
            newY = y + deltaY
            newHeight = height - deltaY
            break
          case "bottom":
            newHeight = height + deltaY
            // Don't change newY
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
            // Don't change newX
            break
          case "bottom-left":
            newX = x + deltaX
            newWidth = width - deltaX
            newHeight = height + deltaY
            // Don't change newY
            break
          case "bottom-right":
            newWidth = width + deltaX
            newHeight = height + deltaY
            // Don't change newX or newY
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

        // Update bbox_px if it exists - with corrected min/max values
        let updatedBbox = obj.bbox_px
        if (updatedBbox) {
          // Calculate new center in pixels
          const newCenterX = (boundedX / 100) * imageRef.current!.naturalWidth
          const newCenterY = (boundedY / 100) * imageRef.current!.naturalHeight
          const halfWidthPx = ((newPercentWidth / 100) * imageRef.current!.naturalWidth) / 2
          const halfHeightPx = ((newPercentHeight / 100) * imageRef.current!.naturalHeight) / 2

          // Update bbox_px based on new dimensions with CORRECTED min/max
          updatedBbox = {
            min: [newCenterX - halfWidthPx, newCenterY - halfHeightPx],
            max: [newCenterX + halfWidthPx, newCenterY + halfHeightPx],
          }
        }

        return {
          ...obj,
          position: {
            x: boundedX,
            y: boundedY,
            width: newPercentWidth,
            height: newPercentHeight,
          },
          bbox_px: updatedBbox,
          has_been_modified: true,
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

    // Mark the object as modified
    if (resizedBoxIdRef.current !== null) {
      setSelectedObjects((prev) =>
        prev.map((obj) => (obj.id === resizedBoxIdRef.current ? { ...obj, has_been_modified: true } : obj)),
      )
    }

    resizedBoxIdRef.current = null
    resizeHandleRef.current = null

    document.removeEventListener("mousemove", handleResizeMove as unknown as EventListener)
    document.removeEventListener("mouseup", handleResizeEnd)
  }, [handleResizeMove])

  // Drawing handlers - updated for three-click system with line drawing
  const handleMouseDown = (e: React.MouseEvent) => {
    // Always allow drawing, even if a box is selected
    if (isDraggingRef.current || isResizingRef.current) return

    if (containerRef.current && imageRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - containerRect.left
      const y = e.clientY - containerRect.top

      // Check if click is within image bounds
      const imgRect = imageRef.current.getBoundingClientRect()
      const relativeX = e.clientX - imgRect.left
      const relativeY = e.clientY - imgRect.top

      if (relativeX < 0 || relativeY < 0 || relativeX > imgRect.width || relativeY > imgRect.height) {
        return // Click outside image bounds
      }

      // Store the last click position for interface positioning
      setLastClickPosition({ x: e.clientX, y: e.clientY })

      // If a box is selected, deselect it first
      if (selectedBoxId && drawingStep === 1) {
        boxEscape()
        return
      }

      if (!selectedBoxId) {
        if (drawingStep === 1) {
          // First click - set start point
          setIsDrawing(true)
          setStartPoint({ x, y })
          setCurrentPoint({ x, y })
          setDrawingStep(2)
        } else if (drawingStep === 2) {
          // Second click - set line end point (just draw a line, not a box)
          setLineEndPoint({ x, y })
          setDrawingStep(3)
        } else if (drawingStep === 3) {
          // Third click - create object based on the cursor's position relative to the line
          if (startPoint && lineEndPoint) {
            // Calculate the line vector
            const lineVectorX = lineEndPoint.x - startPoint.x
            const lineVectorY = lineEndPoint.y - startPoint.y
            const lineLength = Math.hypot(lineVectorX, lineVectorY)

            // Calculate the angle of the line
            const lineAngle = Math.atan2(lineVectorY, lineVectorX)

            // Calculate the vector from the line to the current point
            const cursorVectorX = x - startPoint.x
            const cursorVectorY = y - startPoint.y

            // Calculate the perpendicular distance from the cursor to the line
            // Using the formula for distance from a point to a line
            const perpDistance =
              Math.abs(lineVectorX * (startPoint.y - y) - lineVectorY * (startPoint.x - x)) / lineLength

            // Determine which side of the line the cursor is on
            // Using the cross product to determine the sign
            const crossProduct = lineVectorX * (y - startPoint.y) - lineVectorY * (x - startPoint.x)
            const side = Math.sign(crossProduct)

            // Set the width to be the line length
            const width = lineLength

            // Set the height to be the perpendicular distance (only on one side)
            const height = perpDistance

            // Calculate the center point of the rectangle
            // It should be at the midpoint of the line, offset by half the height in the perpendicular direction
            const midpointX = (startPoint.x + lineEndPoint.x) / 2
            const midpointY = (startPoint.y + lineEndPoint.y) / 2

            // Calculate the perpendicular unit vector
            const perpVectorX = -lineVectorY / lineLength
            const perpVectorY = lineVectorX / lineLength

            // Adjust the direction based on which side of the line the cursor is on
            const adjustedPerpVectorX = perpVectorX * side
            const adjustedPerpVectorY = perpVectorY * side

            // Calculate the center of the rectangle
            const centerX = midpointX + (adjustedPerpVectorX * height) / 2
            const centerY = midpointY + (adjustedPerpVectorY * height) / 2

            // Only create a box if it's big enough
            if (width > 10 && height > 10) {
              // Convert to percentages
              const { width: imgWidth, height: imgHeight } = imageDimensionsRef.current
              const percentX = (centerX / imgWidth) * 100
              const percentY = (centerY / imgHeight) * 100
              const percentWidth = (width / imgWidth) * 100
              const percentHeight = (height / imgHeight) * 100

              // Calculate the corners of the box in the image coordinate system
              // For the bbox_px, we need to calculate the min and max points
              // We'll calculate the four corners of the rotated rectangle
              const halfWidth = width / 2
              const halfHeight = height / 2

              // Calculate the four corners of the rotated rectangle
              const corners = [
                {
                  x: centerX - halfWidth * Math.cos(lineAngle) - halfHeight * Math.sin(lineAngle),
                  y: centerY - halfWidth * Math.sin(lineAngle) + halfHeight * Math.cos(lineAngle),
                },
                {
                  x: centerX + halfWidth * Math.cos(lineAngle) - halfHeight * Math.sin(lineAngle),
                  y: centerY + halfWidth * Math.sin(lineAngle) + halfHeight * Math.cos(lineAngle),
                },
                {
                  x: centerX + halfWidth * Math.cos(lineAngle) + halfHeight * Math.sin(lineAngle),
                  y: centerY + halfWidth * Math.sin(lineAngle) - halfHeight * Math.cos(lineAngle),
                },
                {
                  x: centerX - halfWidth * Math.cos(lineAngle) + halfHeight * Math.sin(lineAngle),
                  y: centerY - halfWidth * Math.sin(lineAngle) - halfHeight * Math.cos(lineAngle),
                },
              ]

              // Find min and max coordinates for the bbox
              const minX = Math.min(...corners.map((c) => c.x))
              const minY = Math.min(...corners.map((c) => c.y))
              const maxX = Math.max(...corners.map((c) => c.x))
              const maxY = Math.max(...corners.map((c) => c.y))

              // Create bbox_px
              const bbox_px = {
                min: [
                  (minX / imgWidth) * imageRef.current.naturalWidth,
                  (minY / imgHeight) * imageRef.current.naturalHeight,
                ],
                max: [
                  (maxX / imgWidth) * imageRef.current.naturalWidth,
                  (maxY / imgHeight) * imageRef.current.naturalHeight,
                ],
              }

              const newId = nextUserFurnitureId
              setNextUserFurnitureId((prev) => prev + 1)

              const newObject: ObjectItem = {
                id: newId,
                type: "",
                position: {
                  x: percentX,
                  y: percentY,
                  width: percentWidth,
                  height: percentHeight,
                },
                bbox_px: {
                  min: [bbox_px.min[0], bbox_px.min[1]],
                  max: [bbox_px.max[0], bbox_px.max[1]],
                },
                ai_guess: "",
                verified: false,
                user_created: true,
                original_id: `furniture_${newId}`,
                angle: lineAngle, // Store the angle for rendering
              }

              setSelectedObjects((prev) => [...prev, newObject])

              // Set the selected box ID
              setSelectedBoxId(newId)

              // Position the interface next to the cursor
              setSelectionInterfacePosition({
                x: e.clientX,
                y: e.clientY,
              })
            }

            // Reset drawing state but don't reset the drawing step
            // This allows for uninterrupted drawing
            setIsDrawing(false)
            setStartPoint(null)
            setCurrentPoint(null)
            setLineEndPoint(null)
            // Don't reset drawing step here to allow continuous drawing
          }
        }
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - containerRect.left
    const y = e.clientY - containerRect.top

    if (drawingStep === 2) {
      // During line drawing
      setCurrentPoint({ x, y })
    } else if (drawingStep === 3 && startPoint && lineEndPoint) {
      // During box creation after line is drawn
      setCurrentPoint({ x, y })
    }
  }

  const handleMouseUp = () => {
    // We don't complete drawing on mouse up anymore - we wait for the clicks
    // This is just a fallback in case of issues
    if (drawingStep === 1) {
      setIsDrawing(false)
      setStartPoint(null)
      setCurrentPoint(null)
    }
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

  // Handle removing resource image
  const handleRemoveResourceImage = (objectId: number, index: number) => {
    setResources((prev) => {
      const updatedResources = { ...prev }
      if (updatedResources[objectId] && updatedResources[objectId][index]) {
        const updatedObjectResources = { ...updatedResources[objectId] }
        delete updatedObjectResources[index].photo
        updatedResources[objectId] = updatedObjectResources
      }
      return updatedResources
    })
  }

  // Validate if a URL is an image URL
  const isImageUrl = (url: string): boolean => {
    if (!url) return false
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp"]
    const lowerCaseUrl = url.toLowerCase()
    return (
      imageExtensions.some((ext) => lowerCaseUrl.endsWith(ext)) ||
      lowerCaseUrl.includes("/image/") ||
      lowerCaseUrl.includes("images.") ||
      lowerCaseUrl.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/) !== null
    )
  }

  // Handle adding a new resource to an object
  const handleAddResource = (objectId: number) => {
    // Find the highest index currently used
    const currentResources = resources[objectId] || {}
    const indices = Object.keys(currentResources).map(Number)

    // If no resources exist, start with index 0
    // Otherwise, find the next available index (either a gap or the next number)
    let nextIndex = 0
    if (indices.length > 0) {
      // Sort indices to find gaps
      const sortedIndices = [...indices].sort((a, b) => a - b)

      // Find the first gap in indices, or use the next number if no gaps
      for (let i = 0; i < sortedIndices.length; i++) {
        if (sortedIndices[i] !== i) {
          nextIndex = i
          break
        }
      }

      // If no gaps found, use the next number
      if (nextIndex === 0) {
        nextIndex = sortedIndices.length
      }
    }

    // Ensure we don't exceed the maximum of 3 resources
    if (indices.length >= 3) {
      return
    }

    // Add a new empty resource
    setResources((prev) => ({
      ...prev,
      [objectId]: {
        ...(prev[objectId] || {}),
        [nextIndex]: { link: "", photo: "" },
      },
    }))
  }

  // Generate and download JSON
  const handleExportJSON = () => {
    // Create a new JSON structure based on the original format
    const exportData = selectedObjects.map((obj) => {
      const originalId = obj.original_id || `furniture_${obj.id}`

      // Use the original bbox_px if it exists and the object hasn't been moved or resized
      let exportBbox = obj.bbox_px
      if (obj.original_bbox_px && !obj.user_created && !obj.has_been_modified) {
        exportBbox = obj.original_bbox_px
      }

      return {
        id: originalId,
        type: obj.type,
        ai_guess: obj.ai_guess || "",
        verified: obj.verified,
        bbox_px: exportBbox || {
          min: [0, 0],
          max: [0, 0],
        },
        resources: resources[obj.id] || {},
      }
    })

    // Download the JSON file
    downloadJSON(exportData, "furniture_data.json")
  }

  // Handle form submission
  const handleSubmit = () => {
    // Check if all objects with a type have at least one resource
    const objectsWithType = selectedObjects.filter((obj) => obj.type)
    const allHaveResources = objectsWithType.every(
      (obj) => resources[obj.id] && Object.keys(resources[obj.id]).length > 0,
    )

    if (allHaveResources) {
      updateFormData({ selectedObjects, objectResources: resources })
      onNext()
    } else {
      // If validation fails, switch to resources tab to prompt user
      setActiveTab("resources")
    }
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
      transform: `translate(-50%, -50%) ${obj.angle ? `rotate(${obj.angle}rad)` : ""}`,
      transformOrigin: "center center",
    }
  }

  // Get resize handle style
  const getHandleStyle = (position: string): React.CSSProperties => {
    const styles: Record<string, React.CSSProperties> = {
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

  // Get drawing rectangle style for the third click
  const getDrawingRectStyle = (): React.CSSProperties | null => {
    if (drawingStep !== 3 || !startPoint || !lineEndPoint || !currentPoint) return null

    // Calculate the line vector
    const lineVectorX = lineEndPoint.x - startPoint.x
    const lineVectorY = lineEndPoint.y - startPoint.y
    const lineLength = Math.hypot(lineVectorX, lineVectorY)

    // Calculate the angle of the line
    const lineAngle = Math.atan2(lineVectorY, lineVectorX)

    // Calculate the vector from the line to the current point
    const cursorVectorX = currentPoint.x - startPoint.x
    const cursorVectorY = currentPoint.y - startPoint.y

    // Calculate the perpendicular distance from the cursor to the line
    const perpDistance =
      Math.abs(lineVectorX * (startPoint.y - currentPoint.y) - lineVectorY * (startPoint.x - currentPoint.x)) /
      lineLength

    // Determine which side of the line the cursor is on
    const crossProduct = lineVectorX * (currentPoint.y - startPoint.y) - lineVectorY * (currentPoint.x - startPoint.x)
    const side = Math.sign(crossProduct)

    // Calculate the perpendicular unit vector
    const perpVectorX = -lineVectorY / lineLength
    const perpVectorY = lineVectorX / lineLength

    // Adjust the direction based on which side of the line the cursor is on
    const adjustedPerpVectorX = perpVectorX * side
    const adjustedPerpVectorY = perpVectorY * side

    // Calculate the midpoint of the line
    const midpointX = (startPoint.x + lineEndPoint.x) / 2
    const midpointY = (startPoint.y + lineEndPoint.y) / 2

    // Calculate the center of the rectangle (offset from the midpoint in the perpendicular direction)
    const centerX = midpointX + (adjustedPerpVectorX * perpDistance) / 2
    const centerY = midpointY + (adjustedPerpVectorY * perpDistance) / 2

    return {
      position: "absolute",
      left: `${centerX}px`,
      top: `${centerY}px`,
      width: `${lineLength}px`,
      height: `${perpDistance}px`,
      transform: `translate(-50%, -50%) rotate(${lineAngle}rad)`,
      border: "2px dashed #3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      pointerEvents: "none",
      transformOrigin: "center center",
    }
  }

  // Get drawing line style for the first step
  const getDrawingLineStyle = (): React.CSSProperties | null => {
    if (!isDrawing || !startPoint || !currentPoint || drawingStep !== 2) return null

    return {
      position: "absolute",
      left: `${startPoint.x}px`,
      top: `${startPoint.y}px`,
      width: `${Math.hypot(currentPoint.x - startPoint.x, currentPoint.y - startPoint.y)}px`,
      height: "2px",
      backgroundColor: "#3b82f6",
      transformOrigin: "left center",
      transform: `rotate(${Math.atan2(currentPoint.y - startPoint.y, currentPoint.x - startPoint.x)}rad)`,
      pointerEvents: "none",
    }
  }

  // Get fixed line style (after second click)
  const getFixedLineStyle = (): React.CSSProperties | null => {
    if (!startPoint || !lineEndPoint || drawingStep !== 3) return null

    return {
      position: "absolute",
      left: `${startPoint.x}px`,
      top: `${startPoint.y}px`,
      width: `${Math.hypot(lineEndPoint.x - startPoint.x, lineEndPoint.y - startPoint.y)}px`,
      height: "2px",
      backgroundColor: "#22c55e", // Green color for the fixed line
      transformOrigin: "left center",
      transform: `rotate(${Math.atan2(lineEndPoint.y - startPoint.y, lineEndPoint.x - startPoint.x)}rad)`,
      pointerEvents: "none",
    }
  }

  // Deselect the current box
  const boxEscape = () => {
    setSelectedBoxId(null)
    setSelectionInterfacePosition(null)

    // Continue drawing process immediately
    setDrawingStep(1)
  }

  // Get object display name
  const getObjectDisplayName = (obj: ObjectItem): string => {
    const idPart = obj.original_id || `furniture_${obj.id}`
    if (obj.type) {
      return `${idPart} (${obj.type})`
    }
    return idPart
  }

  // Check if device is mobile
  const isMobile = () => {
    if (typeof window !== "undefined") {
      return window.innerWidth <= 768
    }
    return false
  }

  // Get the selected object
  const selectedObject = selectedBoxId !== null ? selectedObjects.find((obj) => obj.id === selectedBoxId) : null

  return (
    <div className="space-y-6">
      <div className="flex space-x-2 border-b overflow-x-auto">
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
              Click once to set the starting point, click again to draw a line, and click a third time to create the
              object on one side of the line.
            </p>

            <div
              className="flex flex-col relative border rounded-lg overflow-visible select-none"
              ref={containerRef}
              onMouseDown={(e) => {
                handleMouseDown(e)
                if (drawingStep === 2) {
                  // If we're in the second step, we can start dragging
                  setIsDragging(true)
                }
              }}
              onMouseMove={(e) => {
                handleMouseMove(e)
                if (isDragging && drawingStep === 2) {
                  // Update current point while dragging
                  if (containerRef.current) {
                    const containerRect = containerRef.current.getBoundingClientRect()
                    const x = e.clientX - containerRect.left
                    const y = e.clientY - containerRect.top
                    setCurrentPoint({ x, y })
                  }
                }
              }}
              onMouseUp={(e) => {
                if (isDragging && drawingStep === 2) {
                  // Complete the line on mouseup
                  if (containerRef.current && startPoint) {
                    const containerRect = containerRef.current.getBoundingClientRect()
                    const x = e.clientX - containerRect.left
                    const y = e.clientY - containerRect.top
                    setLineEndPoint({ x, y })
                    setDrawingStep(3)
                  }
                }
                setIsDragging(false)
                handleMouseUp()
              }}
              onTouchStart={(e) => {
                const touch = e.touches[0]
                const mouseEvent = new MouseEvent("mousedown", {
                  clientX: touch.clientX,
                  clientY: touch.clientY,
                })
                handleMouseDown(mouseEvent as unknown as React.MouseEvent)
              }}
              onTouchMove={(e) => {
                const touch = e.touches[0]
                const mouseEvent = new MouseEvent("mousemove", {
                  clientX: touch.clientX,
                  clientY: touch.clientY,
                })
                handleMouseMove(mouseEvent as unknown as React.MouseEvent)
              }}
              onTouchEnd={() => {
                handleMouseUp()
              }}
              onMouseLeave={() => {
                if (isDrawing) {
                  setIsDrawing(false)
                  setStartPoint(null)
                  setCurrentPoint(null)
                  setLineEndPoint(null)
                  // Don't reset drawing step to allow continuous drawing
                }
              }}
            >
              <div className="aspect-square w-full relative select-none">
                <Image
                  ref={imageRef}
                  key={previewUrl}
                  src={previewUrl || "/placeholder.svg?height=1024&width=1024"}
                  alt="Your bedroom plan"
                  fill
                  className="object-contain select-none pointer-events-none"
                  crossOrigin="anonymous"
                  onLoad={handleImageLoad}
                  priority
                  draggable="false"
                />

                {/* Drawing line during first step */}
                {getDrawingLineStyle() && <div style={getDrawingLineStyle() || {}} />}

                {/* Fixed line after second click */}
                {getFixedLineStyle() && <div style={getFixedLineStyle() || {}} />}

                {/* Drawing rectangle during third step */}
                {getDrawingRectStyle() && <div style={getDrawingRectStyle() || {}} />}

                {/* Selectable boxes - only render when image is loaded */}
                {imageLoaded &&
                  selectedObjects.map((obj) => (
                    <div
                      key={obj.id}
                      className={`absolute border-2 cursor-pointer transition-colors
                        ${selectedBoxId === obj.id
                          ? "border-yellow-500 bg-yellow-500/30 cursor-move"
                          : obj.type
                            ? "border-green-500 bg-green-500/20"
                            : "border-red-500 bg-red-500/20"
                        }`}
                      style={getBoxStyle(obj, imageDimensionsRef.current)}
                      onClick={(e) => handleBoxClick(obj.id, e)}
                      onMouseDown={(e) => handleDragStart(e, obj.id)}
                      onTouchStart={(e) => {
                        e.stopPropagation()
                        const touch = e.touches[0]
                        const mouseEvent = new MouseEvent("mousedown", {
                          clientX: touch.clientX,
                          clientY: touch.clientY,
                        })
                        handleDragStart(mouseEvent as unknown as React.MouseEvent, obj.id)
                      }}
                    >
                      {/* Resize handles - only show when selected */}
                      {selectedBoxId === obj.id &&
                        RESIZE_HANDLES.map((handle) => (
                          <div
                            key={handle.position}
                            className="absolute w-3 h-3 bg-white border-2 border-gray-400 rounded-full z-10"
                            style={{
                              ...getHandleStyle(handle.position),
                              cursor: handle.cursor,
                            }}
                            onMouseDown={(e) => handleResizeStart(e, obj.id, handle.position)}
                            onTouchStart={(e) => {
                              e.stopPropagation()
                              const touch = e.touches[0]
                              const mouseEvent = new MouseEvent("mousedown", {
                                clientX: touch.clientX,
                                clientY: touch.clientY,
                              })
                              handleResizeStart(mouseEvent as unknown as React.MouseEvent, obj.id, handle.position)
                            }}
                          />
                        ))}

                      {/* AI Suggestion Verification - Mini buttons outside the box */}
                      {obj.ai_guess && !obj.verified && selectedBoxId !== obj.id && (
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex items-center gap-1 z-50">
                          <div className="bg-background px-2 py-1 rounded-md shadow-md text-center">
                            <p className="text-xs font-medium">
                              AI: <span className="font-bold">{obj.ai_guess}</span>
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 bg-green-300 hover:bg-green-500 border-green-800"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleVerifyAiGuess(obj.id, true)
                            }}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 bg-red-300 hover:bg-red-500 border-red-800"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Position the interface next to the cursor
                              setSelectionInterfacePosition({
                                x: e.clientX,
                                y: e.clientY,
                              })
                              setSelectedBoxId(obj.id)
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}

                      {/* Object type label hidden for now */}
                    </div>
                  ))}
              </div>

              {/* Export JSON button */}
              {imageLoaded && (
                <div className="absolute bottom-4 right-4">
                  <Button className="" size="sm" variant="outline" onClick={handleExportJSON}>
                    Export JSON
                  </Button>
                </div>
              )}
            </div>

            {/* Positioned Object Selection Interface - Now positioned next to the cursor */}
            {selectedBoxId !== null && selectionInterfacePosition && (
              <div
                className="fixed z-[1000] bg-background rounded-md shadow-lg border p-4"
                style={{
                  left: `${selectionInterfacePosition.x}px`,
                  top: `${selectionInterfacePosition.y}px`,
                  width: "240px",
                  maxWidth: "90vw",
                }}
              >
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Select Object Type</h3>

                  {selectedObject && (
                    <>
                      <Select
                        value={selectedObject.type}
                        onValueChange={(value) => handleObjectTypeChange(selectedBoxId, value)}
                      >
                        <SelectTrigger>
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

                      {selectedObject.ai_guess && !selectedObject.verified && (
                        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                          <p className="text-sm">
                            AI suggests: <span className="font-medium">{selectedObject.ai_guess}</span>
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="ml-auto"
                            onClick={() => handleVerifyAiGuess(selectedBoxId, true)}
                          >
                            <Check className="h-4 w-4 mr-1" /> Accept
                          </Button>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={boxEscape}>
                      Cancel
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" /> Remove
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your object and remove it from
                            the design.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              if (selectedBoxId !== null) {
                                handleRemoveObject(selectedBoxId)
                              }
                            }}
                          >
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Selected Objects</h2>

            {selectedObjects.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="z-0">
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Object Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedObjects.map((obj) => (
                      <TableRow key={obj.id} className={selectedBoxId === obj.id ? "bg-muted" : ""}>
                        <TableCell>
                          <Badge variant="outline">{obj.original_id || `furniture_${obj.id}`}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {obj.type ? (
                            obj.type.replace("_", " ")
                          ) : (
                            <span className="text-yellow-600">Not selected</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {obj.verified ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                // Position the interface next to the cursor
                                setSelectionInterfacePosition({
                                  x: e.clientX,
                                  y: e.clientY,
                                })
                                setSelectedBoxId(obj.id)
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your object and remove it
                                    from the design.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={(e) => {
                                      e.preventDefault()
                                      handleRemoveObject(obj.id)
                                    }}
                                  >
                                    Continue
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="border rounded-lg p-4 text-center text-muted-foreground">
                No objects detected. Click on the image to add objects.
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
            Please upload photos for each selected object. You can add up to 3 images per object.
          </p>

          {selectedObjects
            .filter((obj) => obj.type)
            .map((object) => {
              // Get the current resources for this object
              const objectResources = resources[object.id] || {}
              const resourceCount = Object.keys(objectResources).length

              return (
                <Card key={object.id} className="p-4">
                  <h3 className="text-xl font-semibold mb-4">{getObjectDisplayName(object)}</h3>

                  {resourceCount === 0 ? (
                    // Initially show only a plus button
                    <div className="flex justify-center">
                      <Button
                        onClick={() => handleAddResource(object.id)}
                        variant="outline"
                        className="h-40 w-40 flex flex-col items-center justify-center gap-2"
                      >
                        <div className="h-12 w-12 rounded-full border-2 border-gray-300 flex items-center justify-center">
                          <span className="text-2xl">+</span>
                        </div>
                        <span>Add Resource</span>
                      </Button>
                    </div>
                  ) : (
                    // Show existing resources and add button if less than 3
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-4">
                        {Object.entries(objectResources).map(([index, resource]) => (
                          <div key={index} className="mb-4 p-4 border rounded-md w-full md:w-[calc(33.333%-1rem)]">
                            <h4 className="text-lg font-medium mb-2">Resource {Number.parseInt(index) + 1}</h4>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor={`${object.id}-${index}-photo`}>Photo</Label>
                                <div className="mt-1 flex items-center">
                                  <div className="relative">
                                    <Input
                                      id={`${object.id}-${index}-photo`}
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleFileChange(object.id, Number.parseInt(index), e)}
                                      className="hidden"
                                    />
                                    <Label
                                      htmlFor={`${object.id}-${index}-photo`}
                                      className="cursor-pointer flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg"
                                    >
                                      {resource.photo ? (
                                        <div className="relative w-full h-full">
                                          <Image
                                            src={resource.photo || "/placeholder.svg?height=128&width=128"}
                                            alt={`${object.type} resource ${Number.parseInt(index) + 1}`}
                                            fill
                                            className="object-cover rounded-lg"
                                          />
                                          <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                            onClick={(e) => {
                                              e.preventDefault()
                                              e.stopPropagation()
                                              handleRemoveResourceImage(object.id, Number.parseInt(index))
                                            }}
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ) : (
                                        <Upload className="w-8 h-8 text-gray-400" />
                                      )}
                                    </Label>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <Label htmlFor={`${object.id}-${index}-link`}>Image Link</Label>
                                <Input
                                  id={`${object.id}-${index}-link`}
                                  type="url"
                                  placeholder="https://example.com/image.jpg"
                                  value={resource.link || ""}
                                  onChange={(e) =>
                                    handleResourceChange(object.id, Number.parseInt(index), "link", e.target.value)
                                  }
                                />
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  const updatedResources = { ...resources }
                                  delete updatedResources[object.id][Number.parseInt(index)]
                                  setResources(updatedResources)
                                }}
                                className="w-full"
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Remove Resource
                              </Button>
                            </div>
                          </div>
                        ))}

                        {/* Add button if less than 3 resources */}
                        {resourceCount < 3 && (
                          <Button
                            onClick={() => handleAddResource(object.id)}
                            variant="outline"
                            className="h-40 w-full md:w-[calc(33.333%-1rem)] flex flex-col items-center justify-center gap-2"
                          >
                            <div className="h-8 w-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
                              <span className="text-xl">+</span>
                            </div>
                            <span>Add Resource</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              )
            })}

          <div className="flex justify-between">
            <Button onClick={() => setActiveTab("selection")} variant="outline">
              Back to Selection
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedObjects
                .filter((obj) => obj.type)
                .some((obj) => !resources[obj.id] || Object.keys(resources[obj.id]).length === 0)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Fixed guide display at the bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 py-3 px-4 shadow-lg border-t z-50 flex justify-center">
        <div className="max-w-6xl w-full flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{drawingInstructions}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs">Start</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs">Line</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-xs">Object</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
