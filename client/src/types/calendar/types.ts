export interface FormFields {
    label: string;
    key: "alcohol" | "cigarettes" | "sugar";
    required: boolean;
    error: string;
    mask: 'numeric' | 'phone' | 'date';
    mark: 'red' | 'blue' | 'yellow';
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

export const MAX_VALUES = {
    alcohol: 500,      // мл
    cigarettes: 20,    // шт
    sugar: 100,        // г
} as const;

export const formatCalendarMonthParam = (d: Date): string => {
    const y = d.getFullYear();
    const mo = d.getMonth() + 1;
    return `${y}-${String(mo).padStart(2, '0')}`;
};

export const formatCalendarDayKey = (
    fullYear: number,
    monthIndex: number,
    day: number,
): string => {
    const mo = monthIndex + 1;
    return `${fullYear}-${String(mo).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

export const formatLocalDateKey = (date: Date): string => {
    return formatCalendarDayKey(date.getFullYear(), date.getMonth(), date.getDate());
};

export const formatDateKey = formatLocalDateKey;

export const apiDateToCalendarKey = (raw: string | Date): string => {
    const d = typeof raw === 'string' ? new Date(raw) : raw;
    if (Number.isNaN(d.getTime())) return '';
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
};

export interface CalendarDayCell {
    day: number;
    inCurrentMonth: boolean;
}

export type CalendarGridCell = CalendarDayCell | null;
