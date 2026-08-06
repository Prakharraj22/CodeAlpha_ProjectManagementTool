import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, LayoutGrid } from 'lucide-react';

export default function Register({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await register(name, email, password); }
    catch (err) { setError(err.message || 'Failed to create account'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      {/* LEFT */}
      <div className="auth-left">
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div style={{ position: 'absolute', top: '25%', right: '15%', width: 280, height: 280, background: 'radial-gradient(circle, rgba(52,211,153,0.14) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(25px)' }} />
        <div style={{ position: 'absolute', bottom: '25%', left: '10%', width: 200, height: 200, background: 'radial-gradient(circle, rgba(124,110,246,0.12) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(20px)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 420, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 52 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #7c6ef6 0%, #4f46e5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 24px rgba(124,110,246,0.45)' }}>
              <LayoutGrid size={22} color="#fff" />
            </div>
            <span style={{ fontSize: 19, fontWeight: 800, color: '#e8ecf4' }}>TaskPulse</span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#e8ecf4', lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: 14 }}>
            Join your team.<br />
            <span style={{ background: 'linear-gradient(135deg, #34d399 0%, #22d3ee 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Start shipping.
            </span>
          </h1>
          <p style={{ fontSize: 14.5, color: '#8b95aa', lineHeight: 1.65 }}>
            Create your workspace account and collaborate with your team in real-time — tasks, comments, and kanban boards included.
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="auth-right">
        <div className="auth-form-container animate-fade-in">
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.025em', marginBottom: 6 }}>Create account</h2>
            <p style={{ fontSize: 14, color: 'var(--text-2)' }}>Fill in your details to get started</p>
          </div>

          {error && (
            <div style={{ background: 'var(--error-subtle)', border: '1px solid rgba(251,113,133,0.3)', color: 'var(--color-error)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: 13, marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-field" style={{ marginBottom: 16 }}>
              <label className="form-label" htmlFor="reg-name">Full name</label>
              <input id="reg-name" type="text" className="input" placeholder="Jane Smith" value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div className="form-field" style={{ marginBottom: 16 }}>
              <label className="form-label" htmlFor="reg-email">Email address</label>
              <input id="reg-email" type="email" className="input" placeholder="jane@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div className="form-field" style={{ marginBottom: 28 }}>
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-password" type={showPw ? 'text' : 'password'} className="input"
                  placeholder="Min 6 characters" value={password}
                  onChange={e => setPassword(e.target.value)} required minLength={6}
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 4 }}
                  aria-label={showPw ? 'Hide' : 'Show'}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" id="register-submit-btn" className="btn btn-primary"
              disabled={loading} style={{ width: '100%', padding: '11px', fontSize: 15, borderRadius: 'var(--radius-lg)' }}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-2)' }}>
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} id="switch-to-login-btn"
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
