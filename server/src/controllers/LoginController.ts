import { Request, Response } from "express";
import LoginServices from "../services/LoginServices";

class LoginController {
    async enter(req: Request, res: Response) {
        try {
            const { login, password } = req.body;

            if (!password) {
                return res.status(400).json({ message: "Поле password обязательное" });
            }
            if (!login) {
                return res.status(400).json({ message: "Поле login обязательное" });
            }

            const result = await LoginServices.enter(login, password);
            return res.json(result);
        } catch (e: any) {
            return res.status(400).json({ message: e.message });
        }
    }

    async verify(req: Request, res: Response) {
        try {
            const { email, code } = req.body;

            if (!email || !code) {
                return res.status(400).json({ 
                    message: "Поля email и code обязательны" 
                });
            }

            const result = await LoginServices.verifyCode(email, code);
            return res.json(result);
        } catch (e: any) {
            return res.status(400).json({ message: e.message });
        }
    }
}

export default new LoginController();