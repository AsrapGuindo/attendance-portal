/* src/pages/Login.jsx */
import axios from 'axios';
import React, { useState } from 'react';
import { Lock, User, ShieldCheck, AlertCircle } from 'lucide-react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // HARDCODED CREDENTIALS
  const ADMIN_USER = "admin";
  const ADMIN_PASS = "admin123";

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError(''); // Clear previous errors

  try {
    const response = await axios.post('http://3.27.150.44/APIs/login.php', {
      username: username,
      password: password
    });

    if (response.data.success) {
      // Store user info if needed
      localStorage.setItem('adminUser', JSON.stringify(response.data.user));
      onLogin(); 
    }
  } catch (err) {
    const errorMsg = err.response?.data?.message || 'Connection to server failed';
    setError(errorMsg);
    setTimeout(() => setError(''), 3000);
  }
};

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]" />

      <div className="w-full max-w-md z-10">
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20">
          <div className="p-10">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex p-4 bg-blue-600 rounded-3xl text-white mb-6 shadow-xl shadow-blue-500/30">
                <ShieldCheck size={32} />
              </div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Portal Access</h1>
              <p className="text-slate-500 font-medium mt-2 uppercase text-[10px] tracking-[0.2em]">MSU-SND Administrative System</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold animate-shake">
                  <AlertCircle size={18} /> {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    required
                    placeholder="Username"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="password"
                    required
                    placeholder="Password"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-blue-600 transition-all active:scale-[0.98] mt-4"
              >
                Authorize Entry
              </button>
            </form>
          </div>
          
          <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
            <p className="text-xs text-slate-400 font-medium italic">
              Authorized personnel only. All access attempts are logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
