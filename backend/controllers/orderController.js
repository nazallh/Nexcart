const Order = require('../models/Order');
const Product = require('../models/Product');

// POST /api/orders - Create order & save to DB
const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, taxPrice, totalPrice } = req.body;

    console.log('\n========================================');
    console.log('📦 NEW ORDER REQUEST');
    console.log('========================================');
    console.log('👤 User     :', req.user.name, `(${req.user.email})`);
    console.log('🛍️  Items    :', orderItems.length, 'item(s)');
    orderItems.forEach((item, i) => {
      console.log(`   [${i+1}] ${item.name} x${item.quantity} @ ₹${item.price}`);
    });
    console.log('📍 Address  :', shippingAddress.city + ', ' + shippingAddress.state);
    console.log('💰 Total    : ₹' + totalPrice);
    console.log('----------------------------------------');

    if (!orderItems || orderItems.length === 0)
      return res.status(400).json({ message: 'No order items' });

    // Verify products and stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ message: `Product not found: ${item.product}` });
      if (product.stock < item.quantity) return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'Razorpay',
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice
    });

    // Reduce stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, sold: item.quantity }
      });
    }

    console.log('✅ Order CREATED in MongoDB');
    console.log('🆔 Order ID :', order._id);
    console.log('📌 Status   :', order.orderStatus);
    console.log('💳 Paid     :', order.isPaid ? 'YES' : 'NO (pending payment)');
    console.log('========================================\n');

    res.status(201).json(order);
  } catch (err) {
    console.error('❌ Order creation error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders/myorders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.product', 'name image')
      .sort({ createdAt: -1 });

    console.log(`\n📋 [${req.user.name}] fetched ${orders.length} order(s)`);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name image price');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin)
      return res.status(403).json({ message: 'Not authorized' });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/orders/:id/pay
const markOrderPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.isPaid = true;
    order.paidAt = Date.now();
    order.orderStatus = 'Processing';
    order.paymentResult = {
      razorpay_order_id: req.body.razorpay_order_id,
      razorpay_payment_id: req.body.razorpay_payment_id,
      razorpay_signature: req.body.razorpay_signature,
      status: 'paid'
    };

    const updated = await order.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/orders/:id/ship
const markOrderShipped = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.orderStatus = 'Shipped';
    order.shippedAt = Date.now();
    order.trackingNumber = req.body.trackingNumber || `NX${Date.now()}`;
    const updated = await order.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/orders/:id/deliver
const markOrderDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.orderStatus = 'Delivered';
    order.deliveredAt = Date.now();
    const updated = await order.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders (admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, markOrderPaid, markOrderShipped, markOrderDelivered, getAllOrders };
