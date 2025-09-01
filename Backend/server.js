import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import clientRoutes from './routes/clientRoutes.js';


const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 8000;

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

console.log("STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY);
connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/admin',adminRoutes)
app.use('/api/client',clientRoutes)

app.use((req, res) => {
    res.status(404).json({ message: 'Page Not Found', type: 'error', status: 404 });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});