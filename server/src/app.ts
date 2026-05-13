import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import router from "./routers/router";

const app = express();

app.use(cors({
    origin: ['http://localhost', 'http://localhost:80', 'http://127.0.0.1'],
    credentials: true,
}));

app.use(express.json());
app.use('/api', router);

const PORT = process.env.PORT;
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mydatabase';

async function startApp(): Promise<void> {
    try {
        await mongoose.connect(mongoURI);
        app.listen(PORT, () => console.log(`App listening on port ${PORT}`));
    } catch (e) {
        console.error(e);
    }
}

startApp();