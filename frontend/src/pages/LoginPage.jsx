/**
 * LoginPage.jsx
 * ------------------------------------------------------------------
 * Public route. Shows LoginForm; on success, redirects to wherever
 * the user was headed (or the dashboard by default).
 * ------------------------------------------------------------------
 */
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  return (
    <div style={{ maxWidth: 360, margin: '80px auto', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontWeight: 800, fontSize: 20 }}>Get Handyman</div>
        <div style={{ color: 'var(--gray)', fontSize: 13, marginTop: 4 }}>Worker login</div>
      </div>
      <LoginForm onSuccess={() => navigate(from, { replace: true })} />
    </div>
  );
}
