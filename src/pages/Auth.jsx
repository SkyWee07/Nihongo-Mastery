import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
    <div className="min-h-[calc(100vh-70px)] flex justify-center items-center p-4 sm:p-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="glass-panel w-full max-w-[400px] p-6 sm:p-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-text-main mb-2">{isLogin ? 'Masuk ke Akun' : 'Daftar Akun Baru'}</h2>
          <p className="text-text-muted text-[0.9rem]">{isLogin ? 'Selamat datang kembali pejuang JLPT!' : 'Mulai perjalanan bahasa Jepang Anda hari ini.'}</p>
        </div>

        {error && <div className="bg-red-500/10 border-l-4 border-red-500 text-red-300 py-3 px-4 rounded-md mb-6 text-[0.9rem]">{error}</div>}

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-[0.9rem] font-medium text-text-main">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh@email.com"
              required
              className="bg-slate-900/60 border border-white/10 text-text-main py-3 px-4 rounded-lg text-base transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_rgba(99,102,241,0.2)]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[0.9rem] font-medium text-text-main">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              required
              minLength={6}
              className="bg-slate-900/60 border border-white/10 text-text-main py-3 px-4 rounded-lg text-base transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_rgba(99,102,241,0.2)]"
            />
          </div>
          <button type="submit" className="bg-primary text-white border-none py-3.5 px-4 rounded-lg text-base font-semibold cursor-pointer transition-all duration-200 mt-2 hover:bg-indigo-600 hover:-translate-y-px disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-primary disabled:hover:translate-y-0" disabled={loading}>
            {loading ? 'Memproses...' : (isLogin ? 'Masuk' : 'Daftar')}
          </button>
        </form>

        <div className="mt-8 text-center text-[0.9rem] text-text-muted">
          <p>
            {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            <button 
              className="bg-transparent border-none text-primary font-semibold cursor-pointer p-0 ml-1 hover:underline" 
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
