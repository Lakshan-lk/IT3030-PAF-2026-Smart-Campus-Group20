import React from 'react';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-full max-w-md bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] p-8 md:p-12 border border-slate-100"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-indigo-200">
            <h1 className="text-3xl font-black text-white">S</h1>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-500 bg-clip-text text-transparent mb-2">Smart Campus</h2>
          <p className="text-slate-500 font-medium">Operations Hub</p>
        </div>

        <button 
          onClick={handleLogin}
          className="w-full relative flex items-center justify-center gap-3 bg-white text-slate-700 font-bold py-3.5 px-6 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm transition-all active:scale-[0.98]"
        >
          <FcGoogle className="text-2xl" />
          <span>Sign in with Google</span>
        </button>

        <p className="text-center text-sm text-slate-400 mt-8 font-medium">
          By continuing, you agree to our Terms of Service & Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
