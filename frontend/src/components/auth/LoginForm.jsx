/**
 * LoginForm.jsx
 * ------------------------------------------------------------------
 * Email/password form for worker login. Pure presentational form
 * wiring — the actual auth call lives in useAuth() (AuthContext),
 * this component just collects input and reports errors.
 * ------------------------------------------------------------------
 */
import { useState } from 'react';
import Button from '../ui/Button.jsx';
import FieldLabel from '../ui/FieldLabel.jsx';
import useAuth from '../../hooks/useAuth.js';

export default function LoginForm({ onSuccess }) {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  }

  const inputStyle = {
    width: '100%',
    border: '1px solid var(--gray-light)',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 13,
    marginBottom: 14,
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldLabel>Email</FieldLabel>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={inputStyle}
      />
      <FieldLabel>Password</FieldLabel>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={inputStyle}
      />
      {error && (
        <div style={{ color: 'var(--red)', fontSize: 12, marginBottom: 12 }}>{error}</div>
      )}
      <Button type="submit" variant="primary" style={{ width: '100%' }} disabled={loading}>
        {loading ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
