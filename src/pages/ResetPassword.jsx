import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await resetPassword(email);
      setMessage('Password reset email sent. Check your Gmail (or spam folder).');
    } catch (err) {
      console.error('Reset password failed:', err);
      setError('Failed to send reset email. Please check the email address and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
        <h1 style={{ marginBottom: '20px', fontSize: '1.8rem', color: '#111827' }}>Reset Password</h1>

        {error && (
          <div style={{ marginBottom: '16px', color: '#b91c1c', background: '#fee2e2', padding: '12px', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ marginBottom: '16px', color: '#064e3b', background: '#d1fae5', padding: '12px', borderRadius: '8px' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '20px' }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px', background: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
          >
            {loading ? 'Sending reset email…' : 'Send Reset Email'}
          </button>
        </form>

        <p style={{ marginTop: '18px', color: '#4b5563' }}>
          Back to <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
