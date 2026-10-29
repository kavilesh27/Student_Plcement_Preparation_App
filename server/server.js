require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required. Set it in server/.env before starting the API.');
}

// Connect to MongoDB and start server
const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  PlacementPrep AI API Server Running on Port ${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  MongoDB: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_portal'}`);
    console.log(`=======================================================`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`[Unhandled Rejection Error]: ${err.message}`);
    // server.close(() => process.exit(1));
  });
};

startServer();
