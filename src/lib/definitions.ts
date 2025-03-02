
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