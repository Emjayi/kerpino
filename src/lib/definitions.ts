
export type User = {
    id: string;
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    birthday: string;
    company: string;
    role: string;
    site_address: string;
    phone: string;
    has_what: boolean;
};

export type UserInput = {
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    birthday: string;
    company: string;
    role: string;
    site_address: string;
    phone: string;
    has_what: boolean;
};

export type Order = {
    id: string;
    orderNumber: string;
    orderDate: string;
    orderStatus: string;
    orderTotal: number;
    orderDueDate: string;
    orderPaid: boolean;
}

export interface FormDimensions {
    value: string;
    unit: "meters" | "feet";
}

export type FormDataType = {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    companyName: string;
    position: string;
    companyWebsite: string;
    email: string;
    phone: string;
    hasWhatsApp: boolean;
    whatsAppNumber: string;
    designPlan: null | string;
    dimensions: FormDimensions;
    selectedObjects: string[];
}

export interface Position {
    x: number // Stored as percentage (0-100)
    y: number // Stored as percentage (0-100)
    width: number // Stored as percentage (0-100)
    height: number // Stored as percentage (0-100)
}

export interface ResourceItem {
    photo?: string
    link?: string
}


export interface FormData {
    designPlan?: File
    selectedObjects?: ObjectItem[]
    objectResources?: Resources
    [key: string]: any
}

export interface ObjectSelectionProps {
    formData: FormData
    updateFormData: (data: Partial<FormData>) => void
    onNext: () => void
    onBack: () => void
    objectsJSON?: Array<{ id: number; x: number; y: number; width?: number; height?: number }>
}

export interface ImageDimensions {
    width: number
    height: number
    top: number
    left: number
    naturalWidth: number
    naturalHeight: number
}


// API Response Types
export interface DetectedObject {
    id: number
    x: number
    y: number
    width: number
    height: number
    confidence: number
    class?: string
}

export interface ObjectDetectionResponse {
    objects: DetectedObject[]
    processingTime: number
}

export interface ShowroomGenerationResponse {
    showroomUrl: string
    estimatedTime: number
}
export interface BoundingBox {
    max: [number, number] // [x, y] coordinates for max point
    min: [number, number] // [x, y] coordinates for min point
}

export interface FurnitureItem {
    id: string | number
    ai_guess?: string
    bbox_px: BoundingBox
    verified: boolean
    label?: string
    furniture_type?: string
}

export interface Position {
    x: number
    y: number
    width: number
    height: number
}

// Update the ObjectItem interface
export interface ObjectItem {
    id: number
    type: string
    position: Position
    bbox_px?: BoundingBox
    ai_guess?: string
    verified?: boolean
    user_created?: boolean
    original_id?: string
    original_bbox_px?: BoundingBox // Store the original bounding box
    has_been_modified?: boolean // Track if the object has been moved or resized
}

export interface ImageDimensions {
    width: number
    height: number
    top: number
    left: number
    naturalWidth: number
    naturalHeight: number
}

export interface ResourceItem {
    photo?: string
    link?: string
}

export interface Resources {
    [key: string]: {
        [key: string]: ResourceItem
    }
}

export interface ObjectSelectionProps {
    formData: FormData
    updateFormData: (data: FormData) => void
    onNext: () => void
    onBack: () => void
}
