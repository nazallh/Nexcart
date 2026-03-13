import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) { toast.success('Welcome back! 👋'); navigate('/'); }
    else toast.error(result.message);
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>⚡ Nex<span style={{ color: '#6366f1' }}>Cart</span></div>
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Welcome back</h2>
          <p style={{ color: '#6b6b82', fontSize: 14 }}>Sign in to your account</p>
        </div>

        <div className="card card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Your password" value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} type="submit" disabled={loading}>
              {loading ? '⏳ Signing in...' : '→ Sign In'}
            </button>
          </form>
          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: 14, color: '#6b6b82' }}>
            Don't have an account? <Link to="/register" style={{ color: '#818cf8', fontWeight: 600 }}>Create one →</Link>
          </p>
        </div>

        <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: 16, marginTop: 16 }}>
          <p style={{ fontSize: 12, color: '#818cf8', fontWeight: 600, marginBottom: 4 }}>🧪 Test Credentials</p>
          <p style={{ fontSize: 12, color: '#6b6b82' }}>Register a new account to get started</p>
        </div>
      </div>
    </div>
  );
}
