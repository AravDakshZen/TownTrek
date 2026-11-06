import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, AtSign, Calendar, MapPin, CheckCircle, Save, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCity } from '../context/CityContext';
import { useToast } from '../context/ToastContext';
import { CitySelectorModal } from '../components/CitySelectorModal';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import api from '../services/api';

const AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
];

export const UserProfilePage: React.FC = () => {
  const { user, login } = useAuth();
  const { selectedCity, setSelectedCity, userProfile, setUserProfile } = useCity();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.fullName || userProfile?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [username, setUsername] = useState(
    userProfile?.username || (user?.fullName ? user.fullName.toLowerCase().replace(/\s+/g, '_') : 'explorer')
  );
  const [age, setAge] = useState<number | ''>(userProfile?.age || 24);
  const [avatarUrl, setAvatarUrl] = useState(userProfile?.avatarUrl || AVATARS[0]);
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.fullName || '');
      if (!email) setEmail(user.email || '');
      if (user.city) setSelectedCity(user.city);
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Validation Error', 'Full Name is required.');
      return;
    }
    if (!email.trim()) {
      toast.error('Validation Error', 'Email Address is required.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.put('/auth/profile', {
        fullName: fullName.trim(),
        email: email.trim(),
        city: selectedCity,
      });

      if (res.data?.success) {
        // Update auth state with refreshed token/user details
        if (res.data.token) {
          login(res.data.token, {
            userId: res.data.userId || user?.userId || 1,
            fullName: res.data.fullName || fullName.trim(),
            email: res.data.email || email.trim(),
            city: selectedCity,
          });
        }

        // Update local profile state
        setUserProfile({
          name: fullName.trim(),
          age: Number(age) || 24,
          username: username.trim(),
          avatarUrl,
        });

        toast.success('Profile Saved', 'Your account details have been successfully updated.');
      } else {
        toast.error('Save Failed', res.data?.error || 'Could not update profile in database.');
      }
    } catch (err: any) {
      // Still update local state if backend route has temporary notice
      setUserProfile({
        name: fullName.trim(),
        age: Number(age) || 24,
        username: username.trim(),
        avatarUrl,
      });
      toast.info('Profile Updated', 'Local explorer preferences saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 font-['Be_Vietnam_Pro',sans-serif]">
      {/* Top Navigation Back */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-sky-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <h1 className="text-[24px] font-bold text-slate-900 dark:text-white font-['Be_Vietnam_Pro',sans-serif]">
          User Profile &amp; Preferences
        </h1>

        <div className="w-16" />
      </div>

      {/* Main Glass Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 shadow-2xl p-6 sm:p-10"
      >
        <form onSubmit={handleSaveProfile} className="space-y-8">
          
          {/* Avatar and Header Info */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-200 dark:border-white/10">
            <div className="relative group">
              <Avatar className="w-24 h-24 ring-4 ring-brand-500/30 shadow-xl">
                <AvatarImage src={avatarUrl} alt={fullName} />
                <AvatarFallback className="text-xl font-bold bg-brand-600 text-white">
                  {fullName.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <h2 className="text-[24px] font-bold text-slate-900 dark:text-white font-['Be_Vietnam_Pro',sans-serif]">
                {fullName || 'Explorer Profile'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-light desc-lighter">
                Manage your personal identity, contact email, and active city passes.
              </p>

              {/* Avatar Preset Selector */}
              <div className="pt-2 flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mr-1">Avatar:</span>
                {AVATARS.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatarUrl(src)}
                    className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-transform ${
                      avatarUrl === src ? 'border-brand-500 scale-110 shadow-md ring-2 ring-brand-500/40' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={src} alt="preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* City Badge with "Change City" popup trigger */}
            <div className="flex flex-col items-center sm:items-end gap-2 bg-indigo-50/50 dark:bg-slate-800/60 p-4 rounded-2xl border border-indigo-100 dark:border-white/5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current District</span>
              <span className="font-bold text-indigo-600 dark:text-sky-400 text-base">
                {selectedCity}
              </span>
              <button
                type="button"
                onClick={() => setCityModalOpen(true)}
                className="mt-1 px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm transition-all"
              >
                Change City
              </button>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aravindh Murugesh"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm font-['Be_Vietnam_Pro',sans-serif]"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@towntrek.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm font-['Be_Vietnam_Pro',sans-serif]"
                />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                Username
              </label>
              <div className="relative">
                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. aravindh_07"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm font-['Be_Vietnam_Pro',sans-serif]"
                />
              </div>
            </div>

            {/* Age */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                Age
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  min="13"
                  max="120"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 24"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm font-['Be_Vietnam_Pro',sans-serif]"
                />
              </div>
            </div>

            {/* Updated City (Interactive Field triggering 3-city popup) */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                Updated City
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    readOnly
                    value={selectedCity}
                    onClick={() => setCityModalOpen(true)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm cursor-pointer shadow-sm font-['Be_Vietnam_Pro',sans-serif]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setCityModalOpen(true)}
                  className="px-5 py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-100 transition-colors"
                >
                  Change City &rarr;
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-light desc-lighter">
                Choose between Chennai, Bangalore, or Mumbai to personalize cinema schedules, concert gigs, and passes.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => navigate('/passes')}
              className="px-5 py-3 rounded-full text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              View My Passes
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition-all active:scale-98 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Profile Details</span>
            </button>
          </div>
        </form>
      </motion.div>

      {/* 3-City Selector Modal */}
      <CitySelectorModal
        isOpen={cityModalOpen}
        onClose={() => setCityModalOpen(false)}
      />
    </div>
  );
};

export default UserProfilePage;

