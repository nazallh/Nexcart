import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Cart() {
  const { cart, updateQty, removeFromCart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const shipping = cartTotal > 499 ? 0 : 49;
  const tax = Math.round(cartTotal * 0.18);
  const total = cartTotal + shipping + tax;

  const handleCheckout = () => {
    if (!user) { toast.error('Please login to continue'); navigate('/login'); return; }
    navigate('/checkout');
  };

  if (cart.length === 0) return (
    <div className="page-wrapper">
      <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: 80, marginBottom: 20 }}>🛒</div>
        <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 28, marginBottom: 12 }}>Your cart is empty</h2>
        <p style={{ color: '#6b6b82', marginBottom: 28 }}>Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn btn-primary btn-lg">Start Shopping</Link>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h1 className="page-title">Shopping Cart <span style={{ fontSize: 18, color: '#6b6b82', fontWeight: 400 }}>({cart.length} items)</span></h1>
          <button className="btn btn-danger btn-sm" onClick={clearCart}>Clear All</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28, alignItems: 'start' }}>
          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {cart.map(item => (
              <div key={item._id} className="card" style={{ display: 'flex', gap: 16, padding: 16, alignItems: 'center' }}>
                <img src={item.image} alt={item.name} style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 10, background: '#1e1e2e', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <Link to={`/products/${item._id}`} style={{ fontWeight: 600, fontSize: 15, color: '#f1f1f5' }}>{item.name}</Link>
                  <div style={{ color: '#6b6b82', fontSize: 12, marginTop: 2 }}>{item.category}</div>
                  <div style={{ fontWeight: 700, fontSize: 18, marginTop: 6 }}>₹{item.price.toLocaleString()}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: '#1e1e2e', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <button onClick={() => updateQty(item._id, item.quantity - 1)} style={{ width: 36, height: 36, background: 'none', border: 'none', color: '#f1f1f5', fontSize: 18, cursor: 'pointer' }}>-</button>
                  <span style={{ width: 32, textAlign: 'center', fontWeight: 600, fontSize: 14 }}>{item.quantity}</span>
                  <button onClick={() => updateQty(item._id, item.quantity + 1)} style={{ width: 36, height: 36, background: 'none', border: 'none', color: '#f1f1f5', fontSize: 18, cursor: 'pointer' }}>+</button>
                </div>
                <div style={{ textAlign: 'right', minWidth: 80 }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>₹{(item.price * item.quantity).toLocaleString()}</div>
                  <button onClick={() => removeFromCart(item._id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 12, cursor: 'pointer', marginTop: 6 }}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="card card-body" style={{ position: 'sticky', top: 80 }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: 20 }}>Order Summary</h3>
            {[['Subtotal', `₹${cartTotal.toLocaleString()}`], ['Shipping', shipping === 0 ? 'FREE' : `₹${shipping}`], ['GST (18%)', `₹${tax.toLocaleString()}`]].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                <span style={{ color: '#a1a1b5' }}>{label}</span>
                <span style={{ fontWeight: 600, color: val === 'FREE' ? '#10b981' : '#f1f1f5' }}>{val}</span>
              </div>
            ))}
            <div className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, fontWeight: 700, fontSize: 18 }}>
              <span>Total</span><span style={{ color: '#818cf8' }}>₹{total.toLocaleString()}</span>
            </div>
            {shipping > 0 && <p style={{ fontSize: 12, color: '#f59e0b', marginBottom: 16, textAlign: 'center' }}>Add ₹{(499 - cartTotal).toLocaleString()} more for free shipping!</p>}
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleCheckout}>Proceed to Checkout →</button>
            <Link to="/products" style={{ display: 'block', textAlign: 'center', marginTop: 12, fontSize: 13, color: '#818cf8' }}>Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
