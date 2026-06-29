import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initializeSocket } from './config/socket.js';

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Start server and connect to DB
const startServer = async () => {
    await connectDB();
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
};

startServer();