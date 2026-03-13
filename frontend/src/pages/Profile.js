import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      pincode: user?.address?.pincode || '',
      country: user?.address?.country || 'India'
    }
  });

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleAddr = (e) => setForm(p => ({ ...p, address: { ...p.address, [e.target.name]: e.target.value } }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email, phone: form.phone, address: form.address };
      if (form.password) payload.password = form.password;
      const { data } = await API.put('/user/profile', payload);
      updateUser(data);
      toast.success('Profile updated ✅');
      setForm(p => ({ ...p, password: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [{ id: 'profile', label: '👤 Profile' }, { id: 'address', label: '📍 Address' }, { id: 'security', label: '🔒 Security' }];

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 800 }}>
        {/* Header */}
        <div className="card card-body" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 22 }}>{user?.name}</h2>
            <p style={{ color: '#6b6b82', fontSize: 14 }}>{user?.email}</p>
          </div>
          <Link to="/my-orders" className="btn btn-outline">📦 My Orders</Link>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#16161f', borderRadius: 12, padding: 4, border: '1px solid rgba(255,255,255,0.06)' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                flex: 1, padding: '9px 16px', borderRadius: 9, border: 'none', cursor: 'pointer',
                background: tab === t.id ? '#6366f1' : 'transparent',
                color: tab === t.id ? '#fff' : '#6b6b82', fontWeight: 600, fontSize: 13, transition: 'all 0.2s'
              }}>{t.label}</button>
          ))}
        </div>

        <form onSubmit={handleSave}>
          <div className="card card-body">
            {tab === 'profile' && (
              <>
                <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: 20 }}>Personal Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" name="name" value={form.name} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
                </div>
              </>
            )}

            {tab === 'address' && (
              <>
                <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: 20 }}>Shipping Address</h3>
                <div className="form-group">
                  <label className="form-label">Street Address</label>
                  <input className="form-input" name="street" value={form.address.street} onChange={handleAddr} placeholder="123 Main Street" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-input" name="city" value={form.address.city} onChange={handleAddr} placeholder="Mumbai" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input className="form-input" name="state" value={form.address.state} onChange={handleAddr} placeholder="Maharashtra" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">PIN Code</label>
                    <input className="form-input" name="pincode" value={form.address.pincode} onChange={handleAddr} placeholder="400001" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input className="form-input" name="country" value={form.address.country} onChange={handleAddr} />
                  </div>
                </div>
              </>
            )}

            {tab === 'security' && (
              <>
                <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: 20 }}>Change Password</h3>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input className="form-input" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Leave blank to keep current" />
                </div>
                <p style={{ fontSize: 13, color: '#6b6b82', marginBottom: 16 }}>Password must be at least 6 characters long.</p>
              </>
            )}

            <button className="btn btn-primary" type="submit" disabled={saving} style={{ marginTop: 8 }}>
              {saving ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
