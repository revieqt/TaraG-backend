import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from "path";
import { createServer } from 'http';
import { Server } from 'socket.io';
import admin from 'firebase-admin';
import authRouter from './routes/auth';
import weatherRouter from './routes/weather';
import itineraryRouter from './routes/itinerary';
import contactRouter from './routes/contact';
import alertRouter from './routes/alert';
import notificationRouter from './routes/notification';
import userRouter from './routes/user';
import aiChatRouter from './routes/aiChat';
import amenitiesRouter from './routes/amenities';
import routeRouter from './routes/routes';
import paymentRouter from './routes/payment';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use('/api/public', express.static(path.join(__dirname, "../public")));
app.use('/api/auth', authRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/itinerary', itineraryRouter);
app.use('/api/contact', contactRouter);
app.use('/api/alerts', alertRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/user', userRouter);
app.use('/api/ai-chat', aiChatRouter);
app.use('/api/amenities', amenitiesRouter);
app.use('/api/routes', routeRouter);
app.use('/api/payment', paymentRouter);

// io.on('connection', (socket) => {
//   console.log('User connected:', socket.id);

//   socket.on('join-user', (userId: string) => {
//     socket.join(`user-${userId}`);
//     console.log(`User ${userId} joined room: user-${userId}`);
//   });

//   socket.on('create-notification', async (notificationData) => {
//     try {
//       io.to(`user-${notificationData.userID}`).emit('new-notification', notificationData);
//     } catch (error) {
//       console.error('Error handling notification creation:', error);
//     }
//   });

//   socket.on('disconnect', () => {
//     console.log('User disconnected:', socket.id);
//   });
// });

// Make io available to other modules
export { io };

// Routes will go here
app.get('/', (_req, res) => {
  res.send('TaraG Backend is Running');
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'TaraG Backend is healthy'
  });
});

// Firebase test endpoint
app.get('/test-firebase', async (_req, res) => {
  try {
    const db = admin.firestore();
    const testDoc = await db.collection('test').doc('connection').get();
    res.json({ 
      status: 'ok', 
      message: 'Firebase connection successful',
      exists: testDoc.exists
    });
  } catch (error) {
    console.error('Firebase test error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Firebase connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
