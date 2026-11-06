"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, 
  MapPin, 
  Navigation, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  User as UserIcon,
  Calendar
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useCity } from "../../context/CityContext";
import { AnimatedScriptLogo } from "./animated-script-logo";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

export type AuthStage = "signin" | "signup" | "onboarding-profile" | "onboarding-location";

interface SignIn1Props {
  initialStage?: AuthStage;
}

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
];

const POPULAR_CITIES = [
  { name: "Chennai", tag: "Marina, OMR, Chetpet" },
  { name: "Bangalore", tag: "Koramangala, Indiranagar" },
  { name: "Mumbai", tag: "Bandra, Marine Drive" },
  { name: "Hyderabad", tag: "HITEC City, Banjara Hills" },
  { name: "Delhi", tag: "Connaught Place, Saket" },
];

export const SignIn1: React.FC<SignIn1Props> = ({ initialStage = "signin" }) => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { setSelectedCity, setUserProfile, validateCityWithDB, detectLocationViaGPS } = useCity();

  // Redirect to home if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [stage, setStage] = useState<AuthStage>(initialStage);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [avatarIndex, setAvatarIndex] = useState(0);

  // Location states
  const [cityInput, setCityInput] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [dbChecking, setDbChecking] = useState(false);
  const [dbMatchResult, setDbMatchResult] = useState<{ matched: boolean; count: number; sampleMatches: string[] } | null>(null);

  // Status states
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Real-time ignorecase DB verification when user types city
  useEffect(() => {
    if (!cityInput.trim()) {
      setDbMatchResult(null);
      return;
    }
    const timer = setTimeout(async () => {
      setDbChecking(true);
      const res = await validateCityWithDB(cityInput);
      setDbMatchResult(res);
      setDbChecking(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [cityInput, validateCityWithDB]);

  const validateEmail = (str: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);

  // 1. Handle Sign In
  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }
    if (!validateEmail(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      if (res.data.success && res.data.token) {
        const userCity = res.data.city || "Chennai";
        login(res.data.token, {
          userId: res.data.userId,
          fullName: res.data.fullName || "TownTrek User",
          email: res.data.email || email.trim(),
          city: userCity,
        });
        setSelectedCity(userCity);
        toast.success("Welcome Back!", `Signed in as ${res.data.fullName || email.trim()} • District: ${userCity}`);
        navigate("/");
      } else {
        setError(res.data.message || "Invalid credentials. Please verify your email and password.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid email address or password in database."
      );
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Create Account (Sign Up) in the SAME card
  const handleSignUp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !password) {
      setError("Please fill in email and password.");
      return;
    }
    if (!validateEmail(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register", {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        city: cityInput.trim() || "Chennai",
      });

      if (res.data.success && res.data.token) {
        const userCity = res.data.city || cityInput.trim() || "Chennai";
        login(res.data.token, {
          userId: res.data.userId,
          fullName: res.data.fullName || fullName.trim(),
          email: res.data.email || email.trim(),
          city: userCity,
        });
        toast.success("Account Created!", "Now personalize your district explorer profile.");
        // Seamlessly advance to onboarding on the exact same component and update route
        try {
          window.history.pushState(null, '', '/onboarding');
        } catch (_) {}
        setStage("onboarding-profile");
      } else {
        setError(res.data.message || "Failed to create account. Email may already be in use.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration error. Email may already exist in database."
      );
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Onboarding Step 1 (Name & Age)
  const handleProfileNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!age || Number(age) < 13 || Number(age) > 120) {
      setError("Please enter a valid age (13+).");
      return;
    }
    setError("");
    // Seamless transition to location without showing multiple sections at the top
    setStage("onboarding-location");
  };

  // 4. Handle GPS detection
  const handleGpsDetect = async () => {
    setGpsLoading(true);
    try {
      const detected = await detectLocationViaGPS();
      setCityInput(detected);
      toast.success("Location Detected", `Nearest district: ${detected}`);
    } catch {
      setCityInput("Chennai");
      toast.info("GPS Default", "Using default metropolitan district: Chennai");
    } finally {
      setGpsLoading(false);
    }
  };

  // 5. Handle Onboarding Step 2 (Finish & Save Location)
  const handleLocationFinish = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCity = cityInput.trim() || "Chennai";

    // Persist district directly to users table in MySQL database
    api.put("/auth/city", { city: finalCity }).catch(() => {});

    setUserProfile({
      name: fullName.trim() || "TownTrek Explorer",
      age: Number(age) || 24,
      username: fullName.trim().toLowerCase().replace(/\s+/g, "_") || "user",
      avatarUrl: AVATAR_PRESETS[avatarIndex],
    });
    setSelectedCity(finalCity);

    toast.success("District Personalized!", `Showing theatres, shows, events & spots in ${finalCity}`);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 relative overflow-hidden w-full px-4 py-12 transition-colors duration-300">
      
      {/* Ambient background glows for white & dark themes */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-brand-500/20 via-sky-400/15 to-purple-500/20 rounded-full blur-3xl pointer-events-none opacity-60 dark:opacity-40" />

      {/* Background Blur Overlay for Onboarding Stage */}
      {(stage === "onboarding-profile" || stage === "onboarding-location") && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-0 bg-slate-900/35 dark:bg-black/60 backdrop-blur-2xl pointer-events-none"
        />
      )}

      {/* Centered Liquid Glass Card (pure white theme & pure dark theme adaptive) */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md rounded-3xl bg-white/95 dark:bg-neutral-900/90 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 shadow-2xl p-6 sm:p-8 flex flex-col items-center transition-all duration-300">
        
        {/* Brand Wordmark & District Badge */}
        <div className="flex flex-col items-center justify-center mb-5">
          <AnimatedScriptLogo text="towntrek" />
          <span className="text-[11px] font-bold text-brand-600 dark:text-sky-400 uppercase tracking-widest mt-1">
            District Passes &amp; Cinema Portal
          </span>
        </div>

        {/* Dynamic Card Content Based on Active Stage */}
        <AnimatePresence mode="wait">
          {/* ─────────────────────────────────────────────────────────────
              STAGE 1: SIGN IN
          ───────────────────────────────────────────────────────────── */}
          {stage === "signin" && (
            <motion.div
              key="signin"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="w-full flex flex-col items-center"
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1.5 text-center">
                Sign In to Your District Pass
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-6">
                Access your verified cinema seats, concert tickets &amp; workshop RSVPs
              </p>

              <form onSubmit={handleSignIn} className="flex flex-col w-full gap-3.5">
                <div className="relative">
                  <input
                    placeholder="name@towntrek.com"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 border border-slate-200 dark:border-white/10 shadow-sm"
                  />
                </div>

                <div className="relative">
                  <input
                    placeholder="Password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 border border-slate-200 dark:border-white/10 shadow-sm"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center space-x-2 text-left">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-slate-900 hover:bg-slate-800 dark:bg-white/15 dark:hover:bg-white/25 active:scale-98 text-white font-bold px-5 py-3.5 rounded-full shadow-lg border border-slate-900 dark:border-white/20 transition text-sm flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>

                <div className="w-full text-center mt-3 pt-2 border-t border-slate-200/80 dark:border-white/10">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setStage("signup");
                      }}
                      className="font-bold text-brand-600 dark:text-sky-400 hover:underline"
                    >
                      Sign up, it&apos;s free!
                    </button>
                  </span>
                </div>
              </form>
            </motion.div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              STAGE 2: CREATE ACCOUNT (Inside the EXACT SAME Card)
          ───────────────────────────────────────────────────────────── */}
          {stage === "signup" && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="w-full flex flex-col items-center"
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1.5 text-center">
                Create Your Account
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-6">
                Direct SQL registration with instant pass issuance
              </p>

              <form onSubmit={handleSignUp} className="flex flex-col w-full gap-3.5">
                <div className="relative">
                  <input
                    placeholder="Full Name (e.g. Aravindh Murugesh)"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 border border-slate-200 dark:border-white/10 shadow-sm"
                  />
                </div>

                <div className="relative">
                  <input
                    placeholder="name@towntrek.com"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 border border-slate-200 dark:border-white/10 shadow-sm"
                  />
                </div>

                <div className="relative">
                  <input
                    placeholder="Create a password (min. 6 characters)"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 border border-slate-200 dark:border-white/10 shadow-sm"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center space-x-2 text-left">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-brand-600 hover:bg-brand-500 active:scale-98 text-white font-bold px-5 py-3.5 rounded-full shadow-lg shadow-brand-500/25 transition text-sm flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Create Account &rarr;</span>
                  )}
                </button>

                <div className="w-full text-center mt-3 pt-2 border-t border-slate-200/80 dark:border-white/10">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setStage("signin");
                      }}
                      className="font-bold text-brand-600 dark:text-sky-400 hover:underline"
                    >
                      Sign in
                    </button>
                  </span>
                </div>
              </form>
            </motion.div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              STAGE 3: ONBOARDING — NAME & AGE (No separate tabs at top)
          ───────────────────────────────────────────────────────────── */}
          {stage === "onboarding-profile" && (
            <motion.div
              key="onboarding-profile"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="w-full flex flex-col items-center"
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1.5 text-center">
                Personalize Your Profile
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-5">
                Set up your district pass identity
              </p>

              {/* Avatar Preset Selector */}
              <div className="w-full mb-5 p-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-11 h-11 ring-2 ring-brand-500">
                    <AvatarImage src={AVATAR_PRESETS[avatarIndex]} alt="avatar" />
                    <AvatarFallback>{fullName.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Pass Avatar</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Pick a preset</p>
                  </div>
                </div>

                <div className="flex space-x-1.5">
                  {AVATAR_PRESETS.map((src, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatarIndex(i)}
                      className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-transform ${
                        avatarIndex === i ? "border-brand-500 scale-110 shadow-sm" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={src} alt="avatar" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleProfileNext} className="flex flex-col w-full gap-3.5">
                <div className="space-y-1 text-left">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      placeholder="e.g. Aravindh Murugesh"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 border border-slate-200 dark:border-white/10 shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Age
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      placeholder="e.g. 24"
                      type="number"
                      min="13"
                      max="120"
                      required
                      value={age}
                      onChange={(e) => setAge(e.target.value ? Number(e.target.value) : "")}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 border border-slate-200 dark:border-white/10 shadow-sm"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center space-x-2 text-left">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Next button directly transitions to location page without separate tabs */}
                <button
                  type="submit"
                  className="w-full mt-2 bg-brand-600 hover:bg-brand-500 active:scale-98 text-white font-bold px-5 py-3.5 rounded-full shadow-lg shadow-brand-500/25 transition text-sm flex items-center justify-center space-x-2"
                >
                  <span>Next: Choose District Location</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              STAGE 4: ONBOARDING — LOCATION (Shown after Next button)
          ───────────────────────────────────────────────────────────── */}
          {stage === "onboarding-location" && (
            <motion.div
              key="onboarding-location"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="w-full flex flex-col items-center"
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1.5 text-center">
                Select Your District Location
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-5">
                Cinemas, gigs &amp; workshops will match your chosen district
              </p>

              {/* Share GPS Location Button */}
              <button
                type="button"
                onClick={handleGpsDetect}
                disabled={gpsLoading}
                className="w-full mb-4 p-3.5 rounded-2xl border border-brand-500/30 bg-brand-500/10 hover:bg-brand-500/15 text-brand-600 dark:text-sky-300 flex items-center justify-between transition-all group active:scale-98"
              >
                <div className="flex items-center space-x-3 text-left">
                  <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    {gpsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4 group-hover:rotate-45 transition-transform" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Share Location via GPS</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Auto-detect nearest metropolitan</p>
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-brand-500 shrink-0" />
              </button>

              <div className="flex items-center space-x-2 text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-3 w-full">
                <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                <span>or enter city manually</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
              </div>

              <form onSubmit={handleLocationFinish} className="flex flex-col w-full gap-3.5">
                <div className="relative text-left">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    placeholder="e.g. Chennai, Bangalore, Mumbai..."
                    type="text"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white dark:bg-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 border border-slate-200 dark:border-white/10 shadow-sm"
                  />
                  {dbChecking && (
                    <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />
                  )}
                </div>

                {/* Case-insensitive DB Validation Feedback */}
                {cityInput.trim() && !dbChecking && dbMatchResult && (
                  <div className={`p-2.5 rounded-xl text-xs space-y-0.5 border text-left ${
                    dbMatchResult.matched
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
                  }`}>
                    <div className="flex items-center space-x-1.5 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {dbMatchResult.matched
                          ? `✓ ${dbMatchResult.count} places matched for "${cityInput}"`
                          : `Custom district "${cityInput}"`}
                      </span>
                    </div>
                  </div>
                )}

                {/* Quick Select City Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {POPULAR_CITIES.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setCityInput(c.name)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                        cityInput.toLowerCase() === c.name.toLowerCase()
                          ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                          : "bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-brand-500"
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStage("onboarding-profile")}
                    className="px-4 py-3 rounded-full text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    &larr; Back
                  </button>

                  <button
                    type="submit"
                    className="flex-1 bg-brand-600 hover:bg-brand-500 active:scale-98 text-white font-bold px-5 py-3.5 rounded-full shadow-lg shadow-brand-500/25 transition text-sm flex items-center justify-center space-x-2"
                  >
                    <span>Finish &amp; Start Exploring</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Community Explorer Avatars at bottom */}
      <div className="relative z-10 mt-8 flex flex-col items-center text-center">
        <p className="text-slate-500 dark:text-gray-400 text-xs mb-2">
          Join <span className="font-semibold text-slate-900 dark:text-white">thousands</span> of city explorers and movie lovers discovering live district passes on TownTrek.
        </p>
        <div className="flex -space-x-1.5">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
            alt="user"
            className="w-7 h-7 rounded-full border-2 border-white dark:border-black object-cover shadow-sm"
          />
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"
            alt="user"
            className="w-7 h-7 rounded-full border-2 border-white dark:border-black object-cover shadow-sm"
          />
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80"
            alt="user"
            className="w-7 h-7 rounded-full border-2 border-white dark:border-black object-cover shadow-sm"
          />
          <img
            src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&auto=format&fit=crop&q=80"
            alt="user"
            className="w-7 h-7 rounded-full border-2 border-white dark:border-black object-cover shadow-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default SignIn1;
