import React, { useState } from 'react';

interface AuthModalProps {
  mode: 'login' | 'register';
  onLogin: (email: string, password: string) => Promise<{ token?: string; error?: string }>;
  onRegister: (username: string, email: string, password: string) => Promise<{ token?: string; error?: string }>;
  onClose: () => void;
  onSwitchMode: (mode: 'login' | 'register') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ mode, onLogin, onRegister, onClose, onSwitchMode }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (mode === 'login') {
        result = await onLogin(email, password);
      } else {
        result = await onRegister(username, email, password);
      }
      if (result.error) {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
        {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 8 }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label>Username</label>
              <input value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Register'}
            </button>
          </div>
        </form>
        <p style={{ textAlign: 'center', marginTop: 12, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {mode === 'login' ? (
            <>Don't have an account? <button style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }} onClick={() => onSwitchMode('register')}>Register</button></>
          ) : (
            <>Already have an account? <button style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }} onClick={() => onSwitchMode('login')}>Sign In</button></>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
