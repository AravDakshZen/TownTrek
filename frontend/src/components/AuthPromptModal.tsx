import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Lock, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPromptModal: React.FC = () => {
  const { authModalOpen, closeAuthModal, authModalMessage } = useAuth();
  const navigate = useNavigate();

  if (!authModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-8 space-y-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-100">
          <Lock className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">Sign In Required</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {authModalMessage}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={() => {
              closeAuthModal();
              navigate('/login');
            }}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Existing Account</span>
          </button>

          <button
            onClick={() => {
              closeAuthModal();
              navigate('/register');
            }}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New Account</span>
          </button>
        </div>

        <div className="pt-2 border-t border-slate-100 text-center">
          <button
            onClick={closeAuthModal}
            className="text-xs text-slate-400 hover:text-slate-600 font-medium"
          >
            Cancel &amp; Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
};

