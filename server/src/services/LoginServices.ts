import User from "../schemas/UserSchema";
import VerificationCode from "../schemas/VerificationCodeSchema";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

interface LoginResult {
    message: string;
    email?: string;
}

interface VerifyResult {
    token: string;
    user: {
        id: string;
        email: string;
    };
}

class LoginServices {
    async enter(login: string, password: string): Promise<LoginResult> {
        const user = await User.findOne({ login: login.toLowerCase() });
        
        if (!user) {
            throw new Error("Неверный email или пароль");
        }

        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            throw new Error("Неверный email или пароль");
        }

        await VerificationCode.updateMany(
            { userId: user._id, isUsed: false },
            { $set: { isUsed: true } }
        );

        const code = Math.floor(1000 + Math.random() * 9000).toString();

        await VerificationCode.create({
            userId: user._id,
            code,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            isUsed: false
        });

        await this.sendVerificationCode(login, code);

        return { 
            message: "Код подтверждения отправлен на вашу почту",
            email: this.maskEmail(login)
        };
    }

    async verifyCode(email: string, code: string): Promise<VerifyResult> {
        const user = await User.findOne({ login: email.toLowerCase() });
        
        if (!user) {
            throw new Error("Пользователь не найден");
        }

        const verificationRecord = await VerificationCode.findOne({
            userId: user._id,
            code,
            isUsed: false,
            expiresAt: { $gt: new Date() }
        });

        if (!verificationRecord) {
            throw new Error("Неверный или истекший код подтверждения");
        }

        verificationRecord.isUsed = true;
        await verificationRecord.save();

        const token = this.generateToken(user);

        return { 
            token, 
            user: { 
                id: user._id.toString(), 
                email: user.login 
            } 
        };
    }

    private async sendVerificationCode(email: string, code: string): Promise<void> {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: `"Вход для сотрудников" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Код подтверждения входа",
            html: `
                <h2>Код подтверждения</h2>
                <p>Ваш код для входа: <strong style="font-size: 24px; letter-spacing: 5px;">${code}</strong></p>
                <p>Код действителен в течение 10 минут.</p>
                <p>Если вы не запрашивали этот код, просто проигнорируйте это письмо.</p>
            `
        });
    }

    private maskEmail(email: string): string {
        const [name, domain] = email.split('@');
        if (name.length <= 2) {
            return `**@${domain}`;
        }
        const maskedName = name[0] + '***' + name[name.length - 1];
        return `${maskedName}@${domain}`;
    }

    private generateToken(user: any): string {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET не настроен в переменных окружения");
        }

        return jwt.sign(
            { 
                userId: user._id, 
                email: user.login 
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
    }
}

export default new LoginServices();