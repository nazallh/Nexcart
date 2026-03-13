import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';

const STATUS_STYLES = {
  Pending:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '⏳' },
  Processing: { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', icon: '⚙️' },
  Shipped:    { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: '🚚' },
  Delivered:  { color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: '✅' },
  Cancelled:  { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: '❌' },
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    API.get('/orders/myorders').then(r => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.orderStatus === filter);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{ marginBottom: 28 }}>
          <h1 className="page-title">My Orders</h1>
          <p className="page-sub">{orders.length} total orders</p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {['all', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{
                padding: '6px 16px', borderRadius: 100, border: '1px solid', cursor: 'pointer',
                borderColor: filter === s ? '#6366f1' : 'rgba(255,255,255,0.08)',
                background: filter === s ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: filter === s ? '#818cf8' : '#6b6b82',
                fontSize: 13, fontWeight: 500, transition: 'all 0.2s'
              }}>
              {s === 'all' ? 'All Orders' : `${STATUS_STYLES[s]?.icon} ${s}`}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
            <h3 style={{ marginBottom: 8 }}>{filter === 'all' ? 'No orders yet' : `No ${filter} orders`}</h3>
            <p style={{ color: '#6b6b82', marginBottom: 24 }}>
              {filter === 'all' ? "You haven't placed any orders yet." : `No orders with status "${filter}".`}
            </p>
            {filter === 'all' && <Link to="/products" className="btn btn-primary">Start Shopping</Link>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map(order => {
              const st = STATUS_STYLES[order.orderStatus] || STATUS_STYLES.Pending;
              return (
                <div key={order._id} className="card" style={{ overflow: 'visible' }}>
                  {/* Order Header */}
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#a1a1b5' }}>ORDER</span>
                        <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'monospace', color: '#f1f1f5' }}>#{order._id.slice(-8).toUpperCase()}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#6b6b82' }}>
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, background: st.bg, color: st.color }}>
                        {st.icon} {order.orderStatus}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: 18 }}>₹{order.totalPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
                      {order.orderItems.slice(0, 4).map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1e1e2e', borderRadius: 8, padding: '6px 10px' }}>
                          <img src={item.image} alt={item.name} style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4 }} />
                          <span style={{ fontSize: 13, color: '#a1a1b5', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                          <span style={{ fontSize: 12, color: '#6b6b82' }}>×{item.quantity}</span>
                        </div>
                      ))}
                      {order.orderItems.length > 4 && (
                        <div style={{ background: '#1e1e2e', borderRadius: 8, padding: '6px 12px', fontSize: 13, color: '#6b6b82' }}>
                          +{order.orderItems.length - 4} more
                        </div>
                      )}
                    </div>

                    {/* Shipping status bar */}
                    {order.orderStatus === 'Shipped' && order.trackingNumber && (
                      <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>🚚</span>
                        <span style={{ fontSize: 13, color: '#93c5fd' }}>Tracking: <strong>{order.trackingNumber}</strong></span>
                      </div>
                    )}

                    {/* Progress stepper */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 16 }}>
                      {['Pending', 'Processing', 'Shipped', 'Delivered'].map((step, i, arr) => {
                        const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
                        const currentIdx = statuses.indexOf(order.orderStatus);
                        const stepIdx = statuses.indexOf(step);
                        const done = currentIdx >= stepIdx && order.orderStatus !== 'Cancelled';
                        const cancelled = order.orderStatus === 'Cancelled';
                        return (
                          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < arr.length - 1 ? 1 : 'none' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                              <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
                                background: cancelled ? 'rgba(239,68,68,0.15)' : done ? '#6366f1' : '#1e1e2e',
                                border: `2px solid ${cancelled ? '#ef4444' : done ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
                                color: done && !cancelled ? '#fff' : '#6b6b82'
                              }}>
                                {done && !cancelled ? '✓' : i + 1}
                              </div>
                              <span style={{ fontSize: 10, color: done && !cancelled ? '#818cf8' : '#6b6b82', whiteSpace: 'nowrap' }}>{step}</span>
                            </div>
                            {i < arr.length - 1 && (
                              <div style={{ flex: 1, height: 2, background: done && !cancelled && currentIdx > stepIdx ? '#6366f1' : 'rgba(255,255,255,0.08)', margin: '0 4px', marginBottom: 14 }} />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Link to={`/orders/${order._id}`} className="btn btn-outline btn-sm">View Details →</Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
