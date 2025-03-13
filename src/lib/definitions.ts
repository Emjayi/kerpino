
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
    [objectId: string]: {
        [index: string]: ResourceItem
    }
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