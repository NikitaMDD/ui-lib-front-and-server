import { CalendarEntry, ICalendarEntry, ICalendarUpsertBody, parseMonthYear, dayStartUtc } from "../schemas/CalendarSchema";

function normalizedCalendarUtcDay(raw: string | Date): Date {
    if (typeof raw === "string") {
        const t = raw.trim();
        const only = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
        if (only) {
            const y = Number(only[1]);
            const mo = Number(only[2]);
            const d = Number(only[3]);
            return new Date(Date.UTC(y, mo - 1, d));
        }
    }
    const parsed = new Date(raw as string | Date);
    if (Number.isNaN(parsed.getTime())) {
        throw new Error("Некорректная дата");
    }
    return dayStartUtc(parsed);
}

class CalendarService {
    async getByMonth(monthParam: string): Promise<ICalendarEntry[]> {
        const parsed = parseMonthYear(monthParam);
        if (!parsed) throw new Error("Некорректный параметр month, ожидается YYYY-MM");

        const { y, m } = parsed;
        const start = new Date(Date.UTC(y, m - 1, 1));
        const end = new Date(Date.UTC(y, m, 1) - 1);

        const entries = await CalendarEntry.find({
            date: { $gte: start, $lte: end },
        }).sort({ date: 1 });

        return entries;
    }

    async upsert(body: ICalendarUpsertBody): Promise<ICalendarEntry> {
        const day = normalizedCalendarUtcDay(body.date);

        const doc = await CalendarEntry.findOneAndUpdate(
            { date: day },
            {
                $set: {
                    date: day,
                    alcohol: body.alcohol,
                    cigarettes: body.cigarettes,
                    sugar: body.sugar,
                },
            },
            { upsert: true, new: true, runValidators: true }
        );

        return doc!;
    }
}

export default new CalendarService();
