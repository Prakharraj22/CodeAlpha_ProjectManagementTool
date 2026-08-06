import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, LayoutGrid, Zap, Users, Activity } from 'lucide-react';

const FEATURES = [
  { icon: Zap,      color: '#7c6ef6', text: 'Real-time sync across your entire team' },
  { icon: Users,    color: '#22d3ee', text: 'Collaborative Kanban boards & task tracking' },
  { icon: Activity, color: '#34d399', text: 'Live activity feed and audit trail' },
];

const DEMO_USERS = [
  { label: 'Prakhar', email: 'prakhar@example.com', role: 'Owner' },
  { label: 'Ananya',  email: 'ananya@example.com',  role: 'Lead' },
  { label: 'Shreyansh', email: 'shreyansh@example.com', role: 'Dev' },
];

export default function Login({ onSwitchToRegister }) {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const doLogin = async (em, pw) => {
    setError(''); setLoading(true);
    try { await login(em, pw); }
    catch (err) { setError(err.message || 'Invalid credentials'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      {/* LEFT — Brand panel */}
      <div className="auth-left">
        {/* Grid background */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: '18%', left: '15%', width: 320, height: 320, background: 'radial-gradient(circle, rgba(124,110,246,0.18) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(30px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 220, height: 220, background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(25px)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 440, width: '100%' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 52 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #7c6ef6 0%, #4f46e5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 24px rgba(124,110,246,0.45)' }}>
              <LayoutGrid size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 19, fontWeight: 800, color: '#e8ecf4', letterSpacing: '-0.02em' }}>TaskPulse</div>
              <div style={{ fontSize: 11, color: 'rgba(139,149,170,0.8)', fontWeight: 500 }}>Enterprise Workspace</div>
            </div>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 38, fontWeight: 900, color: '#e8ecf4', lineHeight: 1.12, letterSpacing: '-0.03em', marginBottom: 16 }}>
            Ship faster.<br />
            <span style={{ background: 'linear-gradient(135deg, #7c6ef6 0%, #22d3ee 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Together.
            </span>
          </h1>
          <p style={{ fontSize: 15, color: '#8b95aa', marginBottom: 44, lineHeight: 1.65 }}>
            The command-center for high-velocity teams. Kanban, real-time collaboration, and audit trails — all in one place.
          </p>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${f.color}18`, border: `1px solid ${f.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} style={{ color: f.color }} />
                  </div>
                  <span style={{ fontSize: 13.5, color: '#8b95aa', lineHeight: 1.5 }}>{f.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT — Form */}
      <div className="auth-right">
        <div className="auth-form-container animate-fade-in">
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.025em', marginBottom: 6 }}>Welcome back</h2>
            <p style={{ fontSize: 14, color: 'var(--text-2)' }}>Sign in to your workspace</p>
          </div>

          {error && (
            <div style={{ background: 'var(--error-subtle)', border: '1px solid rgba(251,113,133,0.3)', color: 'var(--color-error)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: 13, marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={e => { e.preventDefault(); doLogin(email, password); }}>
            <div className="form-field" style={{ marginBottom: 16 }}>
              <label className="form-label" htmlFor="login-email">Email address</label>
              <input
                id="login-email" type="email" className="input"
                placeholder="you@company.com" value={email}
                onChange={e => setEmail(e.target.value)}
                required autoComplete="email"
              />
            </div>

            <div className="form-field" style={{ marginBottom: 26 }}>
              <label className="form-label" htmlFor="login-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password" type={showPw ? 'text' : 'password'}
                  className="input" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  required autoComplete="current-password" style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 4 }}
                  aria-label={showPw ? 'Hide password' : 'Show password'}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" id="login-submit-btn" className="btn btn-primary"
              disabled={loading} style={{ width: '100%', padding: '11px', fontSize: 15, borderRadius: 'var(--radius-lg)' }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Demo accounts */}
          <div style={{ marginTop: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.06em' }}>DEMO ACCOUNTS</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {DEMO_USERS.map(u => (
                <button
                  key={u.email}
                  onClick={() => doLogin(u.email, 'password123')}
                  disabled={loading}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                    padding: '10px 8px', borderRadius: 'var(--radius-md)',
                    background: 'var(--surface-3)', border: '1px solid var(--border)',
                    cursor: 'pointer', transition: 'all 0.15s',
                    color: 'var(--text-1)'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-border)'; e.currentTarget.style.background = 'var(--primary-subtle)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface-3)'; }}
                >
                  <span style={{ fontWeight: 700, fontSize: 12 }}>{u.label}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{u.role}</span>
                </button>
              ))}
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-2)' }}>
            No account?{' '}
            <button onClick={onSwitchToRegister} id="switch-to-register-btn"
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
