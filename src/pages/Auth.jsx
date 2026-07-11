import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        navigate('/'); // Redirect to home on success
      } else {
        await signUp(email, password);
        // Supabase might require email verification, but let's assume it logs them in or tells them to verify
        alert('Registrasi berhasil! Silakan periksa email Anda (jika verifikasi diaktifkan) atau coba Login.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <h2>{isLogin ? 'Masuk ke Akun' : 'Daftar Akun Baru'}</h2>
          <p>{isLogin ? 'Selamat datang kembali pejuang JLPT!' : 'Mulai perjalanan bahasa Jepang Anda hari ini.'}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh@email.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Memproses...' : (isLogin ? 'Masuk' : 'Daftar')}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            <button 
              className="auth-switch-btn" 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              {isLogin ? 'Daftar sekarang' : 'Masuk di sini'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
