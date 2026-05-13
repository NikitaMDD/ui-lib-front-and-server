import mongoose from "mongoose";
import User from "../src/schemas/UserSchema";
import dotenv from "dotenv";

dotenv.config();

async function createTestUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://admin:admin123@mongodb:27017/mydatabase?authSource=admin");
        
        const existingUser = await User.findOne({ login: process.env.TEST_USER });
        if (existingUser) {
            console.log("Тестовый пользователь уже существует!");
            process.exit(0);
        }

        await User.create({
            login: process.env.TEST_USER,
            password: "admin123"
        });

        console.log("Тестовый пользователь создан:");
        console.log("   Email:", process.env.TEST_USER);
        console.log("   Пароль: admin123");
        
        process.exit(0);
    } catch (error) {
        console.error("Ошибка:", error);
        process.exit(1);
    }
}

createTestUser();