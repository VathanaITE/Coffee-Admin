import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';

export default function Settings() {
  const { currentUser } = useAuth();
 const [formData, setFormData] = useState({ 
  newEmail: '', 
  newPassword: '', 
  confirmPassword: '', 
  emailPassword: '', // Specific to Email form
  passPassword: ''   // Specific to Password form
});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const reauthenticate = async (password) => {
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);
    } catch (err) {
      throw new Error('Current password is incorrect');
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
   if (!formData.newEmail || !formData.emailPassword) {
    setError('Please fill in all fields for email update');
    return;
  }

    setLoading(true);
    setError('');
    setMessage('');

   try {
    await reauthenticate(formData.emailPassword); // Use specific key
    await updateEmail(currentUser, formData.newEmail);
    setMessage('Email updated successfully!');
    setFormData((prev) => ({ ...prev, newEmail: '', emailPassword: '' })); // Reset specific key
  } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
   if (!formData.newPassword || !formData.confirmPassword || !formData.passPassword) {
    setError('Please fill in all fields for password update');
    return;
  }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
    await reauthenticate(formData.passPassword); // Use specific key
    await updatePassword(currentUser, formData.newPassword);
    setMessage('Password updated successfully!');
    setFormData((prev) => ({ ...prev, newPassword: '', confirmPassword: '', passPassword: '' })); // Reset specific key
  }catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6'}}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Admin Settings</h1>
        <p style={{ color: '#4b5563', marginBottom: '32px' }}>Manage your email and password</p>

        <div style={{ display: 'grid', gap: '24px' }}>
          {/* Email Update Card */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', padding: '32px', boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#dbeafe', display: 'grid', placeItems: 'center' }}>
                <Mail size={24} color='#3b82f6' />
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#111827', margin: 0 }}>Change Email</h2>
            </div>

            <p style={{ color: '#6b7280', marginBottom: '20px' }}>Current email: <strong>{currentUser?.email}</strong></p>

            <form onSubmit={handleUpdateEmail}>
              {/* New Email Input */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>New Email</label>
                <input
                  type="email"
                  name="newEmail"
                  value={formData.newEmail}
                  onChange={handleInputChange}
                  placeholder="Enter new email"
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '8px', 
                    fontSize: '1rem',
                    boxSizing: 'border-box' // Fixes the size mismatch
                  }}
                />
              </div>
              {/* Current Password Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Current Password</label>
                <input
                  type="password"
                  name="emailPassword"
                  value={formData.emailPassword}
                  onChange={handleInputChange}
                  placeholder="Enter your current password"
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '8px', 
                    fontSize: '1rem',
                    boxSizing: 'border-box' // Fixes the size mismatch
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  backgroundColor: '#3b82f6', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  fontWeight: '700', 
                  cursor: 'pointer',
                  boxSizing: 'border-box' // Ensures button also stays within bounds
                }}
              >
                {loading ? 'Updating…' : 'Update Email'}
              </button>
            </form>
          </div>

          {/* Password Update Card */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', padding: '32px', boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#f3e8ff', display: 'grid', placeItems: 'center' }}>
                  <Lock size={24} color='#a855f7' />
                </div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#111827', margin: 0 }}>Change Password</h2>
              </div>

              <form onSubmit={handleUpdatePassword}>
                {/* Current Password - Usually kept masked for security */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Current Password</label>
                  <input
                    type="password"
                    name="passPassword"
                    value={formData.passPassword}
                    onChange={handleInputChange}
                    placeholder="Enter your current password"
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }}
                  />
                </div>

                {/* New Password with Eye Icon */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPass ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="Enter new password"
                      style={{ width: '100%', padding: '12px', paddingRight: '45px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      {showNewPass ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password with Eye Icon */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm new password"
                      style={{ width: '100%', padding: '12px', paddingRight: '45px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      {showConfirmPass ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: '100%', padding: '12px', backgroundColor: '#a855f7', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                >
                  {loading ? 'Updating…' : 'Update Password'}
                </button>
              </form>
            </div>

          {/* Messages */}
          {error && (
            <div style={{ padding: '16px', backgroundColor: '#fee2e2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px' }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{ padding: '16px', backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: '8px' }}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
