import { Request, Response } from "express";
import CalendarServices from "../services/CalendarServices";
import type { ICalendarUpsertBody } from "../schemas/CalendarSchema";

class CalendarController {
    async getByMonth(req: Request, res: Response) {
        try {
            const month = typeof req.query.month === "string" ? req.query.month : "";
            if (!month) {
                return res.status(400).json({ message: "Укажите query-параметр month=YYYY-MM" });
            }
            const entries = await CalendarServices.getByMonth(month);
            return res.json(entries);
        } catch (e: any) {
            return res.status(500).json({ message: e.message });
        }
    }

    async upsert(req: Request, res: Response) {
        try {
            const body = req.body as ICalendarUpsertBody;
            if (body.date == null) {
                return res.status(400).json({ message: "Поле date обязательно" });
            }
            const saved = await CalendarServices.upsert(body);
            return res.json(saved);
        } catch (e: any) {
            return res.status(500).json({ message: e.message });
        }
    }
}

export default new CalendarController();
