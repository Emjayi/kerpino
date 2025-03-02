"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"
import Image from "next/image"

const OBJECT_TYPES = ["armchair", "bed", "chair", "computer_chair", "couch", "desk", "lamp", "nightstand", "wardrobe"]

export function ObjectSelection({ formData, updateFormData, onBack }) {
  const [selectedObjects, setSelectedObjects] = useState(formData.selectedObjects || [])
  const [currentSelection, setCurrentSelection] = useState(null)
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 })
  const [showDropdown, setShowDropdown] = useState(false)
  const imageRef = useRef(null)
  const previewUrl = formData.designPlan ? URL.createObjectURL(formData.designPlan) : null

  const handleImageClick = (e) => {
    if (!imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setClickPosition({ x, y })
    setShowDropdown(true)
  }

  const handleObjectSelect = (type) => {
    const newObject = {
      id: Date.now(),
      type,
      position: { ...clickPosition },
    }

    setSelectedObjects([...selectedObjects, newObject])
    setShowDropdown(false)
  }

  const handleRemoveObject = (id) => {
    setSelectedObjects(selectedObjects.filter((obj) => obj.id !== id))
  }

  const handleSubmit = () => {
    updateFormData({ selectedObjects })
    alert("Your design order has been submitted successfully!")
  }

  useEffect(() => {
    // Clean up object URLs when component unmounts
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Select Objects in Your Plan</h2>
        <p className="text-muted-foreground">
          Click on objects in your plan and select what each one is from the dropdown menu.
        </p>

        {previewUrl ? (
          <div className="relative border rounded-lg overflow-hidden">
            <div className="relative aspect-video max-h-[500px] w-full">
              <Image
                ref={imageRef}
                src={previewUrl || "/placeholder.svg"}
                alt="Your bedroom plan"
                fill
                className="object-contain cursor-crosshair"
                onClick={handleImageClick}
              />

              {/* Markers for selected objects */}
              {selectedObjects.map((obj) => (
                <div
                  key={obj.id}
                  className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold border-2 border-white"
                  style={{
                    left: `${obj.position.x}%`,
                    top: `${obj.position.y}%`,
                  }}
                >
                  {selectedObjects.indexOf(obj) + 1}
                </div>
              ))}

              {/* Object selection dropdown */}
              {showDropdown && (
                <div
                  className="absolute z-10 bg-card border rounded-md shadow-md p-2 w-48"
                  style={{
                    left: `${clickPosition.x}%`,
                    top: `${clickPosition.y}%`,
                    transform: "translate(-50%, 10px)",
                  }}
                >
                  <Select onValueChange={handleObjectSelect}>
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
                  <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => setShowDropdown(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="border rounded-lg p-8 text-center text-muted-foreground">
            No bedroom plan uploaded. Please go back and upload a plan.
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Selected Objects</h2>

        {selectedObjects.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>Object Type</TableHead>
                <TableHead>Position</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedObjects.map((obj, index) => (
                <TableRow key={obj.id}>
                  <TableCell>
                    <Badge variant="outline">{index + 1}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{obj.type.replace("_", " ")}</TableCell>
                  <TableCell>{`X: ${obj.position.x.toFixed(1)}%, Y: ${obj.position.y.toFixed(1)}%`}</TableCell>
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
            No objects selected yet. Click on your plan to start selecting objects.
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={selectedObjects.length === 0}>
          Submit Design Order
        </Button>
      </div>
    </div>
  )
}

