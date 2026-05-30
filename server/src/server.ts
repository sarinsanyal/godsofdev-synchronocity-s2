import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// ADDED: Helps parse standard form data fields that come alongside your image uploads
app.use(express.urlencoded({ extended: true })); 

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'Mela server is live and routing' });
});

// Mount all API routes
app.use('/api', apiRoutes);

// Generic Error Handler
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});