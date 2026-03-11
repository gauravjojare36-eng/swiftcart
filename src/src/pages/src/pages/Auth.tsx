import React, { useState } from 'react';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, Chrome, ArrowRight, User } from 'lucide-react';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        // Profile creation is handled by AuthContext listener
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-2xl shadow-emerald-500/5"
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black tracking-tighter text-gray-900 mb-2">
            {isLogin ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
          </h2>
          <p className="text-sm text-gray-500">
            {isLogin ? 'Enter your details to access your account' : 'Join our community of style enthusiasts'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 text-xs font-medium p-4 rounded-2xl mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Full Name" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl px-12 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input 
              type="email" 
              placeholder="Email address" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl px-12 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input 
              type="password" 
              placeholder="Password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl px-12 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-emerald-500 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-gray-400 font-bold tracking-widest">Or continue with</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          className="w-full bg-white border border-gray-100 py-4 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-3"
        >
          <Chrome className="w-5 h-5 text-emerald-500" />
          Google Account
        </button>

        <p className="text-center mt-8 text-sm text-gray-500">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-emerald-600 font-bold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
