const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Log every incoming request
app.use((req, res, next) => {
  const time = new Date().toLocaleTimeString('en-IN');
  console.log(`[${time}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth',    require('./routes/authRoutes'));
app.use('/api/products',require('./routes/productRoutes'));
app.use('/api/orders',  require('./routes/orderRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/user',    require('./routes/userRoutes'));

app.get('/', (req, res) => res.json({ message: 'NexCart API Running 🚀' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('🚀 NexCart Server started');
  console.log(`📡 Port     : ${PORT}`);
  console.log(`🌍 URL      : http://localhost:${PORT}`);
  console.log(`🔑 Razorpay : ${process.env.RAZORPAY_KEY_ID}`);
  console.log('========================================\n');
});
