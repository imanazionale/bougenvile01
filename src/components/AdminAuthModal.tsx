import React, { useState } from 'react';
import { X, Lock, Mail, Key, ShieldCheck, UserPlus, LogIn, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { signInAdmin, signUpAdmin } from '../lib/supabase';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (email: string) => void;
  defaultEmail?: string;
  actionReason?: string;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  defaultEmail = 'Nurimaniman22@gmail.com',
  actionReason,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Harap isi alamat email dan kata sandi.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === 'signin') {
        const { data, error } = await signInAdmin(email, password);
        if (error) {
          if (error.message.toLowerCase().includes('invalid login credentials')) {
            setErrorMsg('Email atau password tidak sesuai. Pastikan Anda sudah mendaftar dan mengonfirmasi email.');
          } else if (error.message.toLowerCase().includes('email not confirmed')) {
            setErrorMsg('Email belum dikonfirmasi. Periksa kotak masuk / spam email Anda dan klik tautan konfirmasi dari Supabase.');
          } else {
            setErrorMsg(error.message);
          }
          return;
        }

        if (data.user) {
          setSuccessMsg('Login berhasil! Mode Admin aktif.');
          setTimeout(() => {
            onAuthSuccess(data.user?.email || email);
            onClose();
          }, 800);
        }
      } else {
        const { data, error } = await signUpAdmin(email, password);
        if (error) {
          setErrorMsg(error.message);
          return;
        }

        if (data.session) {
          setSuccessMsg('Pendaftaran berhasil & Anda langsung masuk sebagai Admin!');
          setTimeout(() => {
            onAuthSuccess(data.user?.email || email);
            onClose();
          }, 1000);
        } else {
          setSuccessMsg(
            'Akun admin berhasil didaftarkan! Supabase telah mengirimkan email konfirmasi ke ' +
              email +
              '. Silakan periksa inbox/spam email Anda lalu klik tautan konfirmasi, kemudian kembali login.'
          );
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem saat menghubungi Supabase Auth.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#16181D] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/80 bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Autentikasi Admin Properti
              </h3>
              <p className="text-[11px] text-neutral-400">
                Supabase Auth • Akses Pengelolaan Media & Data
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Reason banner if triggered from an admin action */}
        {actionReason && (
          <div className="px-6 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-200 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{actionReason}</span>
          </div>
        )}

        {/* Mode switcher tabs */}
        <div className="grid grid-cols-2 p-1.5 mx-6 mt-5 bg-neutral-900 rounded-xl border border-neutral-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'signin'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Masuk (Sign In)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'signup'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Daftar Akun Baru</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Email Administrator
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : mode === 'signin' ? (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Masuk sebagai Admin</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Daftarkan Akun Admin</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-2">
            <p className="text-[11px] text-neutral-500 leading-normal">
              Akses publik tetap dapat melihat galeri dan info rumah tanpa login. Autentikasi hanya dibutuhkan untuk mengunggah, mengedit, atau menghapus data.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
