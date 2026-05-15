import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      console.error('Login failed:', err);
      setError('Login failed. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
        <h1 style={{ marginBottom: '20px', fontSize: '1.8rem', color: '#111827' }}>Admin Login</h1>

        {error && (
          <div style={{ marginBottom: '16px', color: '#b91c1c', background: '#fee2e2', padding: '12px', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '16px' }}
          />

          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '20px' }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px', background: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop: '14px', marginBottom: '18px', color: '#4b5563' }}>
          <Link to="/reset-password" style={{ color: '#2563eb', textDecoration: 'none' }}>Forgot password?</Link>
        </p>

        <p style={{ marginTop: '0px', color: '#4b5563' }}>
          No account yet? <Link to="/signup" style={{ color: '#2563eb', textDecoration: 'none' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
