import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import weatherRouter from './routes/weather';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/weather', weatherRouter);

// Routes will go here
app.get('/', (_req, res) => {
  res.send('TaraG Backend is Running');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
