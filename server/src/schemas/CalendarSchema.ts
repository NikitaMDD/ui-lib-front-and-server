import mongoose, { Document, Model, Schema } from "mongoose";

interface ICalendarEntry extends Document {
    date: Date;
    alcohol: number;
    cigarettes: number;
    sugar: number;
    createdAt: Date;
    updatedAt: Date;
}

interface ICalendarUpsertBody {
    date: string | Date;
    alcohol: number;
    cigarettes: number;
    sugar: number;
}

const CalendarEntrySchema = new Schema<ICalendarEntry>(
    {
        date: { type: Date, required: true, unique: true },
        alcohol: { type: Number, required: true, min: 0, default: 0 },
        cigarettes: { type: Number, required: true, min: 0, default: 0 },
        sugar: { type: Number, required: true, min: 0, default: 0 },
    },
    { timestamps: true }
);

function dayStartUtc(d: Date): Date {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function parseMonthYear(monthParam: string): { y: number; m: number } | null {
    const m = monthParam.match(/^(\d{4})-(\d{2})$/);
    if (!m) return null;
    const y = Number(m[1]);
    const month = Number(m[2]); // 1–12 from query ? typically "2026-05" uses 05 as May -> need 1-12
    if (!y || month < 1 || month > 12) return null;
    return { y, m: month }; // calendar month 1-12
}

const CalendarEntry: Model<ICalendarEntry> = mongoose.model<ICalendarEntry>(
    "CalendarEntry",
    CalendarEntrySchema
);

export {
    CalendarEntry,
    CalendarEntrySchema,
    ICalendarEntry,
    ICalendarUpsertBody,
    dayStartUtc,
    parseMonthYear,
};
