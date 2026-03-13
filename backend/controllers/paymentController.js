const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});

// POST /api/payment/create-order
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    console.log('\n========================================');
    console.log('💳 RAZORPAY ORDER CREATION');
    console.log('========================================');
    console.log('👤 User     :', req.user.name);
    console.log('💰 Amount   : ₹' + amount, `(₹${amount} × 100 = ${Math.round(amount * 100)} paise)`);
    console.log('🆔 Order ID :', orderId);

    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `rcpt_${(orderId || Date.now()).toString().slice(-10)}`,
      notes: { orderId: orderId || '' },
      payment: {
        capture: 'automatic',
        capture_options: {
          automatic_expiry_period: 12,
          manual_expiry_period: 7200,
          refund_speed: 'normal'
        }
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    console.log('✅ Razorpay Order Created');
    console.log('🔑 Razorpay Order ID:', razorpayOrder.id);
    console.log('💵 Amount (paise)   :', razorpayOrder.amount);
    console.log('📌 Status           :', razorpayOrder.status);
    console.log('========================================\n');

    res.json({
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error('❌ Razorpay order creation FAILED:', err.message);
    res.status(500).json({ message: 'Razorpay order creation failed', error: err.message });
  }
};

// POST /api/payment/verify
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    console.log('\n========================================');
    console.log('🔐 PAYMENT VERIFICATION');
    console.log('========================================');
    console.log('🆔 DB Order ID        :', orderId);
    console.log('🔑 Razorpay Order ID  :', razorpay_order_id);
    console.log('💳 Razorpay Payment ID:', razorpay_payment_id);
    console.log('🔏 Signature received :', razorpay_signature?.slice(0, 20) + '...');

    // HMAC SHA256 verification
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;
    console.log('🔒 Signature valid    :', isValid ? '✅ YES' : '❌ NO - MISMATCH');

    if (!isValid)
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });

    // Update order in DB
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.orderStatus = 'Processing';
        order.paymentResult = {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          status: 'paid'
        };
        await order.save();

        console.log('----------------------------------------');
        console.log('✅ ORDER PAYMENT CONFIRMED IN DATABASE');
        console.log('🆔 Order ID    :', order._id);
        console.log('👤 Customer    :', req.user.name, `(${req.user.email})`);
        console.log('💰 Amount Paid : ₹' + order.totalPrice);
        console.log('📌 New Status  :', order.orderStatus);
        console.log('🕐 Paid At     :', new Date(order.paidAt).toLocaleString('en-IN'));
        console.log('💳 Payment ID  :', razorpay_payment_id);
        console.log('========================================');
        console.log('🎉 ORDER SUCCESSFULLY SAVED TO MONGODB!');
        console.log('========================================\n');
      } else {
        console.log('⚠️  Warning: Order not found in DB for ID:', orderId);
      }
    }

    res.json({ success: true, message: 'Payment verified & order updated' });
  } catch (err) {
    console.error('❌ Payment verification FAILED:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/payment/key
const getRazorpayKey = (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
};

// GET /api/payment/methods
const getPaymentMethods = (req, res) => {
  res.json({
    methods: ['upi', 'card', 'netbanking', 'wallet', 'emi'],
    upi_apps: ['gpay', 'phonepe', 'paytm', 'bhim'],
    test_upi: 'success@razorpay',
    test_card: '4111 1111 1111 1111'
  });
};

module.exports = { createRazorpayOrder, verifyPayment, getRazorpayKey, getPaymentMethods };
