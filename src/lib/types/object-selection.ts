export type ResizeHandle = "top-left" | "top" | "top-right" | "right" | "bottom-right" | "bottom" | "bottom-left" | "left"

export interface ImageDimensions {
    width: number
    height: number
    top: number
    left: number
    naturalWidth: number
    naturalHeight: number
}

export interface Position {
    x: number
    y: number
    width: number
    height: number
}

export interface ObjectItem {
    id: number
    type: string
    position: Position
}

export interface ResourceItem {
    photo?: string
    link?: string
}

export interface Resources {
    [key: string]: {
        [key: number]: ResourceItem
    }
}

export interface ObjectSelectionProps {
    formData: {
        selectedObjects?: ObjectItem[]
        objectResources?: Resources
        designPlan?: File
    }
    updateFormData: (data: Partial<ObjectSelectionProps['formData']>) => void
    onNext: () => void
    onBack: () => void
    objectsJSON?: Array<{ id: number; x: number; y: number; width?: number; height?: number }>
} 