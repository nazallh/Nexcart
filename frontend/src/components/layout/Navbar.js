import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/'); setDropOpen(false); };

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">Nex<span>Cart</span></span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}>Home</Link>
          <Link to="/products" className={location.pathname.startsWith('/products') ? 'nav-link active' : 'nav-link'}>Products</Link>
        </div>

        <div className="navbar-actions">
          <Link to="/cart" className="cart-btn">
            <span>🛒</span>
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </Link>

          {user ? (
            <div className="user-dropdown" onMouseLeave={() => setDropOpen(false)}>
              <button className="user-btn" onClick={() => setDropOpen(!dropOpen)}>
                <div className="user-avatar">{user.name?.[0]?.toUpperCase()}</div>
                <span className="user-name">{user.name?.split(' ')[0]}</span>
                <span className="drop-arrow">{dropOpen ? '▲' : '▼'}</span>
              </button>
              {dropOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="drop-avatar">{user.name?.[0]?.toUpperCase()}</div>
                    <div>
                      <div className="drop-name">{user.name}</div>
                      <div className="drop-email">{user.email}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to="/profile" className="dropdown-item" onClick={() => setDropOpen(false)}>👤 My Profile</Link>
                  <Link to="/my-orders" className="dropdown-item" onClick={() => setDropOpen(false)}>📦 My Orders</Link>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item logout-item" onClick={handleLogout}>🚪 Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}

          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/products" onClick={() => setMenuOpen(false)}>Products</Link>
          <Link to="/cart" onClick={() => setMenuOpen(false)}>Cart ({cartCount})</Link>
          {user ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
              <Link to="/my-orders" onClick={() => setMenuOpen(false)}>My Orders</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
