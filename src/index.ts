import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import weatherRouter from './routes/weather';
import aiChatRouter from './routes/aiChat';
import itineraryRouter from './routes/itinerary';
import notificationRouter from './routes/notification';

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
app.use('/weather', weatherRouter);
app.use('/api/ai-chat', aiChatRouter);
app.use('/api/itinerary', itineraryRouter);
app.use('/api/notifications', notificationRouter);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room
  socket.on('join-user', (userId: string) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined room: user-${userId}`);
  });

  // Handle notification creation
  socket.on('create-notification', async (notificationData) => {
    try {
      // Emit to specific user
      io.to(`user-${notificationData.userID}`).emit('new-notification', notificationData);
    } catch (error) {
      console.error('Error handling notification creation:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to other modules
export { io };

// Routes will go here
app.get('/', (_req, res) => {
  res.send('TaraG Backend is Running');
});

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
