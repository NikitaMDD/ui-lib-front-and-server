import mongoose from "mongoose";
import User from "../src/schemas/UserSchema";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function createTestUser() {
    let connection;
    
    try {
        const mongoURI = process.env.MONGODB_URI || "mongodb://admin:admin123@localhost:27017/mydatabase?authSource=admin";
        
        console.log("Подключение к MongoDB...");
        connection = await mongoose.connect(mongoURI);
        console.log("MongoDB подключена");
        
        const testEmail = "yuragrycyuk8@gmail.com";
        
        const existingUser = await User.findOne({ login: testEmail });
        if (existingUser) {
            console.log(`Тестовый пользователь уже существует: ${testEmail}`);
            console.log("Удалите его из БД если хотите пересоздать");
            process.exit(0);
        }

        console.log(`Создание пользователя: ${testEmail}...`);
        
        await User.create({
            login: testEmail,
            password: "admin123"
        });

        console.log("\nТестовый пользователь создан:");
        console.log("Email:", testEmail);
        console.log("Пароль: admin123");
        
        process.exit(0);
    } catch (error) {
        console.error("Ошибка:", error);
        process.exit(1);
    } finally {
        if (connection) {
            await mongoose.disconnect();
        }
    }
}

createTestUser();