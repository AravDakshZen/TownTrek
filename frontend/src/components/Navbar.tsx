import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useCity } from '../context/CityContext';
import { LiquidNavbar, NimbusIcons, LiquidNavItem } from './ui/liquid-glass-navbar';
import { LiquidToggle, NimbusToggleIcons } from './ui/liquid-glass-toggle';
import { AnimatedScriptLogo } from './ui/animated-script-logo';
import { CitySelectorModal } from './CitySelectorModal';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { selectedCity } = useCity();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Route items for LiquidNavbar in Be Vietnam Pro 14px
  const navItems: LiquidNavItem[] = [
    { label: 'Home', icon: NimbusIcons.home, fx: 'glow', href: '/' },
    { label: 'Movies', icon: NimbusIcons.movie, fx: 'spin', href: '/movies' },
    { label: 'Concerts', icon: NimbusIcons.music, fx: 'drop', href: '/entertainment' },
    { label: 'Events', icon: NimbusIcons.calendar, fx: 'wave', href: '/events' },
    { label: 'Landmarks', icon: NimbusIcons.landmark, fx: 'pop', href: '/attractions' },
    { label: 'Dining', icon: NimbusIcons.dining, fx: 'drop', href: '/dining' },
    { label: 'Passes', icon: NimbusIcons.ticket, fx: 'glow', href: '/passes' },
  ];

  const getActiveIndex = () => {
    const p = location.pathname;
    if (p.startsWith('/movies')) return 1;
    if (p.startsWith('/entertainment')) return 2;
    if (p.startsWith('/events')) return 3;
    if (p.startsWith('/attractions')) return 4;
    if (p.startsWith('/dining')) return 5;
    if (p.startsWith('/passes')) return 6;
    return 0;
  };

  const activeIndex = getActiveIndex();

  const handleNavChange = (_index: number, item: LiquidNavItem) => {
    if (item.href) {
      navigate(item.href);
    }
  };

  const handleThemeChange = (isDark: boolean) => {
    const nextTheme = isDark ? 'dark' : 'light';
    setTheme(nextTheme);
    toast.info(`Switched to ${nextTheme} theme`);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full px-4 sm:px-8 py-3 bg-white/90 dark:bg-black/90 backdrop-blur-xl transition-colors duration-300 border-b border-black/5 dark:border-white/10 font-['Be_Vietnam_Pro',sans-serif]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left End: Animated Handwritten Script Wordmark on the page itself */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
              <AnimatedScriptLogo text="towntrek" />
            </Link>
          </div>

          {/* Center: Liquid Navbar with WebGL Water Switching Transition (14px words) */}
          <div className="hidden xl:flex items-center justify-center">
            <LiquidNavbar
              tone={theme === 'dark' ? 'dark' : 'light'}
              active={activeIndex}
              onChange={handleNavChange}
              sound={true}
              items={navItems}
            />
          </div>

          {/* Compact Mode for Lg screens */}
          <div className="hidden lg:flex xl:hidden items-center justify-center">
            <LiquidNavbar
              tone={theme === 'dark' ? 'dark' : 'light'}
              active={activeIndex}
              onChange={handleNavChange}
              compact={true}
              sound={true}
              items={navItems}
            />
          </div>

          {/* Right End: City Button (No city icon) + Theme Toggle + User Profile */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
            {/* Active District Glass Pill - City icon removed per user request, opens 3-city modal */}
            {selectedCity && (
              <button
                type="button"
                onClick={() => setCityModalOpen(true)}
                title="Click to switch city location"
                className="hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-full text-[14px] font-medium font-['Be_Vietnam_Pro',sans-serif] bg-black/5 dark:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/15 text-slate-800 dark:text-slate-200 hover:border-brand-500 hover:bg-black/10 dark:hover:bg-white/15 shadow-sm transition-all cursor-pointer"
              >
                <span className="truncate max-w-[110px]">{selectedCity}</span>
              </button>
            )}

            {/* Liquid Theme Toggle */}
            <div className="flex items-center">
              <LiquidToggle
                size={32}
                tone={theme === 'dark' ? 'dark' : 'light'}
                checked={theme === 'dark'}
                onCheckedChange={handleThemeChange}
                icons={{ off: NimbusToggleIcons.sun, on: NimbusToggleIcons.moon }}
                sound={true}
                label="Toggle theme"
              />
            </div>

            {/* User Profile / Join Us Button: Clicking Username goes directly to User Profile page */}
            <div className="hidden sm:flex items-center">
              {isAuthenticated && user ? (
                <LiquidNavbar
                  tone={theme === 'dark' ? 'dark' : 'light'}
                  sound={true}
                  items={[
                    { label: user.fullName.split(' ')[0], href: '/profile', icon: NimbusIcons.user, fx: 'glow' },
                    { label: 'Log Out', fx: 'none' }
                  ]}
                  onChange={(_idx, item) => {
                    if (item.label === 'Log Out') {
                      logout();
                      toast.info('Signed out', 'You have been successfully signed out.');
                    } else if (item.href) {
                      navigate(item.href);
                    }
                  }}
                />
              ) : (
                <LiquidNavbar
                  tone={theme === 'dark' ? 'dark' : 'light'}
                  sound={true}
                  items={[
                    { label: 'Join Us', href: '/auth', icon: NimbusIcons.user, fx: 'glow' }
                  ]}
                  onChange={(_idx, item) => {
                    if (item.href) navigate(item.href);
                  }}
                />
              )}
            </div>

            {/* Mobile Menu Hamburger */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 max-w-7xl mx-auto rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-white/10 shadow-2xl p-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-2 pb-2">
              {navItems.map((item, idx) => {
                const isActive = activeIndex === idx;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      handleNavChange(idx, item);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl text-[14px] font-medium transition-all text-left font-['Be_Vietnam_Pro',sans-serif] ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                        : 'text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <span className="scale-90">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[14px]">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCityModalOpen(true);
                }}
                className="font-medium text-brand-600 dark:text-sky-400 hover:underline"
              >
                {selectedCity ? selectedCity : 'Select Location'}
              </button>

              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-slate-700 dark:text-slate-200 font-medium hover:underline"
                  >
                    {user?.fullName.split(' ')[0]}
                  </Link>
                  <button 
                    onClick={() => { logout(); setMobileMenuOpen(false); }} 
                    className="font-medium text-rose-600 dark:text-rose-400 hover:underline"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white font-medium text-[14px]"
                >
                  Join Us &rarr;
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 3-City Selector Popup Modal matching Screenshot 1 */}
      <CitySelectorModal
        isOpen={cityModalOpen}
        onClose={() => setCityModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
