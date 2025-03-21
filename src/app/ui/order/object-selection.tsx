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

export function ObjectSelectionAndResources({ formData, updateFormData, onNext, onBack }: ObjectSelectionProps) {
  // Extract objectsJSON from formData
  const objectsJSON = formData.objectsJSON || []

  // State for objects and resources
  const [selectedObjects, setSelectedObjects] = useState<ObjectItem[]>(formData.selectedObjects || [])
  const [resources, setResources] = useState<Resources>(formData.objectResources || {})
  const [customObjectType, setCustomObjectType] = useState<string>("")
  const [selectedBoxId, setSelectedBoxId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<"selection" | "resources">("selection")
  const [imageLoaded, setImageLoaded] = useState<boolean>(false)
  const [furnitureData, setFurnitureData] = useState<FurnitureItem[]>([])
  const [nextUserFurnitureId, setNextUserFurnitureId] = useState<number>(1)

  // Drawing state
  const [isDrawing, setIsDrawing] = useState<boolean>(false)
  const [drawingStep, setDrawingStep] = useState<1 | 2>(1) // 1 = first click (max), 2 = second click (min)
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
    if (selectedObjects.length === 0 && objectsJSON.length > 0) {
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
        .filter((id) => id.startsWith("furniture_user_"))
        .map((id) => Number.parseInt(id.replace("furniture_user_", "")))

      if (userIds.length > 0) {
        setNextUserFurnitureId(Math.max(...userIds) + 1)
      }
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

  // Handle box click
  const handleBoxClick = (id: number, e: React.MouseEvent) => {
    if (isDraggingRef.current || isResizingRef.current) {
      e.stopPropagation()
      return
    }
    setSelectedBoxId(id === selectedBoxId ? null : id)
  }

  // Handle object type change
  const handleObjectTypeChange = (id: number, type: string) => {
    setSelectedObjects((objects) => objects.map((obj) => (obj.id === id ? { ...obj, type, verified: true } : obj)))
    // Auto-close the selection after choosing a type
    setSelectedBoxId(null)
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
      original_id: `furniture_user_${newId}`,
    }
    setSelectedObjects((prev) => [...prev, newObject])
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

  // Drawing handlers - updated for two-click system
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

      // If a box is selected, deselect it first
      if (selectedBoxId && drawingStep === 1) {
        boxEscape()
        return
      }

      if (!selectedBoxId && drawingStep === 1) {
        // First click - set max point
        setIsDrawing(true)
        setStartPoint({ x, y })
        setCurrentPoint({ x, y })
        setDrawingStep(2)
      } else if (drawingStep === 2) {
        // Second click - set min point and create object
        if (startPoint) {
          // Calculate rectangle dimensions in pixels
          const maxX = Math.max(startPoint.x, x)
          const maxY = Math.max(startPoint.y, y)
          const minX = Math.min(startPoint.x, x)
          const minY = Math.min(startPoint.y, y)

          const width = maxX - minX
          const height = maxY - minY

          // Only create a box if it's big enough
          if (width > 10 && height > 10) {
            const centerX = minX + width / 2
            const centerY = minY + height / 2

            // Convert to percentages
            const { width: imgWidth, height: imgHeight } = imageDimensionsRef.current
            const percentX = (centerX / imgWidth) * 100
            const percentY = (centerY / imgHeight) * 100
            const percentWidth = (width / imgWidth) * 100
            const percentHeight = (height / imgHeight) * 100

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
              original_id: `furniture_user_${newId}`,
            }

            setSelectedObjects((prev) => [...prev, newObject])
            setSelectedBoxId(newId)
          }

          // Reset drawing state
          setIsDrawing(false)
          setStartPoint(null)
          setCurrentPoint(null)
          setDrawingStep(1)
        }
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !containerRef.current || drawingStep !== 2) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - containerRect.left
    const y = e.clientY - containerRect.top

    setCurrentPoint({ x, y })
  }

  const handleMouseUp = () => {
    // We don't complete drawing on mouse up anymore - we wait for the second click
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

  // Generate and download JSON
  const handleExportJSON = () => {
    // Create a new JSON structure based on the original format
    const exportData = selectedObjects.map((obj) => {
      const originalId = obj.original_id || (obj.user_created ? `furniture_${obj.id}` : `furniture_${obj.id}`)

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

  // Deselect the current box
  const boxEscape = () => {
    setSelectedBoxId(null)
  }

  // Get object display name
  const getObjectDisplayName = (obj: ObjectItem): string => {
    const idPart = obj.original_id || (obj.user_created ? `furniture_user_${obj.id}` : `furniture_${obj.id}`)
    if (obj.type) {
      return `${idPart} (${obj.type})`
    }
    return idPart
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
              Click once to set the first corner of a bounding box, then click again to complete it. Verify AI
              suggestions or manually select object types. You can also drag boxes to reposition them.
            </p>

            <div
              className="flex flex-col relative border rounded-lg overflow-visible"
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => {
                if (isDrawing) {
                  setIsDrawing(false)
                  setStartPoint(null)
                  setCurrentPoint(null)
                  setDrawingStep(1)
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
                              setSelectedBoxId(obj.id)
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}

                      {/* Object Selection Interface - Only show when selected and either rejected AI or manually added */}
                      {selectedBoxId === obj.id && (
                        <div className="absolute z-[50] top-0 left-1/2 transform -translate-x-1/2 -translate-y-[30px] flex flex-col items-center w-full h-full">
                          <div className="bg-background rounded-md py-1 px-2 shadow-md text-center">
                            <div className="p-0 m-0 items-center min-w-36 flex gap-2">
                              <Select value={obj.type} onValueChange={(value) => handleObjectTypeChange(obj.id, value)}>
                                <SelectTrigger className="w-full">
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
                              <Button
                                variant="destructive"
                                size="sm"
                                className="w-full border-red-400"
                                onClick={() => boxEscape()}
                              >
                                Cancel
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="max-h-8 min-w-8 border-destructive hover:bg-destructive group"
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive group-hover:text-background" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete your object and remove
                                      it from the design.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => {
                                        handleRemoveObject(obj.id)
                                        boxEscape()
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

                      {/* Object Label */}
                      {obj.type && (
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-background px-2 py-1 rounded text-xs font-medium shadow">
                          {obj.type}
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              {/* Drawing instructions */}
              {isDrawing && drawingStep === 2 && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-background/90 px-3 py-2 rounded-md shadow-md">
                  <p className="text-sm font-medium">Click again to complete the bounding box</p>
                </div>
              )}

              {/* Export JSON button */}
              {imageLoaded && (
                <div className="absolute bottom-4 right-4">
                  <Button className="" size="sm" variant="outline" onClick={handleExportJSON}>
                    Export JSON
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Selected Objects</h2>

            {selectedObjects.length > 0 ? (
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
                        <Badge variant="outline">
                          {obj.original_id || (obj.user_created ? `furniture_user_${obj.id}` : `furniture_${obj.id}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {obj.type ? obj.type.replace("_", " ") : <span className="text-yellow-600">Not selected</span>}
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
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveObject(obj.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
            Please upload photos and provide links for desired options for each selected object.
          </p>

          {selectedObjects
            .filter((obj) => obj.type)
            .map((object) => (
              <Card key={object.id} className="p-4">
                <h3 className="text-xl font-semibold mb-4">{getObjectDisplayName(object)}</h3>
                <div className="flex flex-wrap gap-4">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="mb-4 p-4 border rounded-md w-full md:w-[calc(33.333%-1rem)]">
                      <h4 className="text-lg font-medium mb-2">Option {index + 1}</h4>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor={`${object.id}-${index}-photo`}>Photo</Label>
                          <div className="mt-1 flex items-center">
                            <div className="relative">
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
                                  <div className="relative w-full h-full">
                                    <Image
                                      src={resources[object.id][index].photo || "/placeholder.svg?height=128&width=128"}
                                      alt={`${object.type} option ${index + 1}`}
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
                                        handleRemoveResourceImage(object.id, index)
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
                </div>
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

