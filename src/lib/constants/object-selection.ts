import type { ResizeHandle } from '../types/object-selection'

export const OBJECT_TYPES: string[] = [
    "armchair",
    "bed",
    "chair",
    "computer_chair",
    "couch",
    "desk",
    "lamp",
    "nightstand",
    "wardrobe",
]

export const DEFAULT_OBJECTS_JSON = [
    { id: 1, x: 25, y: 25, width: 15, height: 10 },
    { id: 2, x: 60, y: 40, width: 12, height: 18 },
    { id: 3, x: 40, y: 70, width: 10, height: 10 },
]

export const RESIZE_HANDLES: Array<{ position: ResizeHandle; cursor: string }> = [
    { position: "top-left", cursor: "nwse-resize" },
    { position: "top", cursor: "ns-resize" },
    { position: "top-right", cursor: "nesw-resize" },
    { position: "right", cursor: "ew-resize" },
    { position: "bottom-right", cursor: "nwse-resize" },
    { position: "bottom", cursor: "ns-resize" },
    { position: "bottom-left", cursor: "nesw-resize" },
    { position: "left", cursor: "ew-resize" },
] 