const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, markOrderPaid, markOrderShipped, markOrderDelivered, getAllOrders } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/all', protect, adminOnly, getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/pay', protect, markOrderPaid);
router.put('/:id/ship', protect, adminOnly, markOrderShipped);
router.put('/:id/deliver', protect, adminOnly, markOrderDelivered);

module.exports = router;
