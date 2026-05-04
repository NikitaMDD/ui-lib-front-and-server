export interface FormFields {
    label: string;
    key: "alcohol" | "cigarettes" | "sugar",
    required: boolean,
    error: string,
    mask: 'numeric' | 'phone' | 'date',
    mark: 'red' | 'blue' | 'yellow',
}

export interface CalendarFormData {
    alcohol: string;
    cigarettes: string;
    sugar: string;
}

export interface CalendarEntry {
    _id?: string;
    date: string;
    alcohol: number;
    cigarettes: number;
    sugar: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CalendarEntry {
    id?: string;
    date: string; // ISO string
    alcohol: number;
    cigarettes: number;
    sugar: number;
}

export const MAX_VALUES = {
    alcohol: 500,      // мл
    cigarettes: 20,    // шт
    sugar: 100,        // г
} as const;

export const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
};