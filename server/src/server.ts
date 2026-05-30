// server.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// THE FIX: Force TypeScript to accept the middleware
app.use(ClerkExpressWithAuth() as any); 

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'Mela server is live and routing' });
});

app.use('/api', apiRoutes);

app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});