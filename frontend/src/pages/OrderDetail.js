import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';

const STATUS_STYLES = {
  Pending:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '⏳' },
  Processing: { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', icon: '⚙️' },
  Shipped:    { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: '🚚' },
  Delivered:  { color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: '✅' },
  Cancelled:  { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: '❌' },
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/orders/${id}`).then(r => setOrder(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!order) return <div style={{ textAlign: 'center', padding: 60 }}>Order not found.</div>;

  const st = STATUS_STYLES[order.orderStatus] || STATUS_STYLES.Pending;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 900 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <button onClick={() => navigate('/my-orders')} className="btn btn-outline btn-sm">← Orders</button>
          <h1 className="page-title" style={{ margin: 0 }}>Order Details</h1>
        </div>

        {/* Status Header */}
        <div className="card card-body" style={{ marginBottom: 20, background: st.bg, border: `1px solid ${st.color}33` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: st.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                {st.icon} {order.orderStatus}
              </div>
              <div style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 700 }}>
                Order #{order._id.slice(-8).toUpperCase()}
              </div>
              <div style={{ fontSize: 13, color: '#6b6b82', marginTop: 4 }}>
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, color: '#6b6b82' }}>Total Amount</div>
              <div style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 700 }}>₹{order.totalPrice.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Items */}
            <div className="card card-body">
              <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: 16 }}>🛍️ Items Ordered</h3>
              {order.orderItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '12px 0', borderBottom: i < order.orderItems.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <img src={item.image} alt={item.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10, background: '#1e1e2e' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{item.name}</div>
                    <div style={{ fontSize: 13, color: '#6b6b82' }}>Qty: {item.quantity} × ₹{item.price.toLocaleString()}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>₹{(item.price * item.quantity).toLocaleString()}</div>
                </div>
              ))}
            </div>

            {/* Shipping address */}
            <div className="card card-body">
              <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: 14 }}>📍 Shipping Address</h3>
              <div style={{ color: '#a1a1b5', lineHeight: 2, fontSize: 14 }}>
                <div>{order.shippingAddress.street}</div>
                <div>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</div>
                <div>{order.shippingAddress.country}</div>
              </div>
            </div>

            {/* Shipping tracker */}
            {order.orderStatus === 'Shipped' && (
              <div className="card card-body" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}>
                <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: 14, color: '#93c5fd' }}>🚚 Shipment Tracking</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: '#6b6b82' }}>Tracking Number:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#93c5fd', fontSize: 15 }}>{order.trackingNumber || 'N/A'}</span>
                </div>
                {order.shippedAt && (
                  <div style={{ fontSize: 13, color: '#6b6b82' }}>
                    Shipped on: {new Date(order.shippedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                )}
              </div>
            )}

            {/* Payment info */}
            <div className="card card-body">
              <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: 14 }}>💳 Payment Information</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#6b6b82', fontSize: 14 }}>Method</span>
                <span style={{ fontWeight: 600 }}>{order.paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#6b6b82', fontSize: 14 }}>Status</span>
                <span style={{ fontWeight: 600, color: order.isPaid ? '#10b981' : '#f59e0b' }}>
                  {order.isPaid ? '✅ Paid' : '⏳ Pending'}
                </span>
              </div>
              {order.isPaid && order.paidAt && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b6b82', fontSize: 14 }}>Paid on</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{new Date(order.paidAt).toLocaleDateString('en-IN')}</span>
                </div>
              )}
              {order.paymentResult?.razorpay_payment_id && (
                <div style={{ marginTop: 12, padding: '10px 12px', background: '#1e1e2e', borderRadius: 8, fontFamily: 'monospace', fontSize: 11, color: '#6b6b82', wordBreak: 'break-all' }}>
                  Payment ID: {order.paymentResult.razorpay_payment_id}
                </div>
              )}
            </div>
          </div>

          {/* Right - Summary */}
          <div className="card card-body" style={{ position: 'sticky', top: 80 }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: 18 }}>Price Summary</h3>
            {[['Items', `₹${order.itemsPrice.toLocaleString()}`], ['Shipping', order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`], ['Tax', `₹${order.taxPrice.toLocaleString()}`]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                <span style={{ color: '#a1a1b5' }}>{l}</span>
                <span style={{ fontWeight: 600, color: v === 'FREE' ? '#10b981' : '#f1f1f5' }}>{v}</span>
              </div>
            ))}
            <div className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 20, marginBottom: 20 }}>
              <span>Total</span><span style={{ color: '#818cf8' }}>₹{order.totalPrice.toLocaleString()}</span>
            </div>
            <Link to="/my-orders" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>← All Orders</Link>
            <Link to="/products" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}>Shop More 🛍️</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
