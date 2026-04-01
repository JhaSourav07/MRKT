import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compareRoutes from './routes/compareRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Allows us to accept JSON data in requests

// Routes
app.use('/api/v1/compare', compareRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Engine is running' });
});

app.listen(PORT, () => {
    console.log(`🚀 Smart Price Engine running on http://localhost:${PORT}`);
});