import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/error.middleware.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import chatRoutes from './routes/chat.routes.js';
import messageRoutes from './routes/message.routes.js';
import callRoutes from './routes/call.routes.js';

const app = express();

// Middlewares
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/me', userRoutes);
app.use('/chats', chatRoutes);
app.use('/messages', messageRoutes);
app.use('/calls', callRoutes);

// Error Handler Middleware
app.use(errorHandler);

export default app;
