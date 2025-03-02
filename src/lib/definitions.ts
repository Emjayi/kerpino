
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