import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  LogIn,
  Shield,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import { KalyanSetuLogo } from './BrandVisuals';
import { useAuth } from '../context/AuthContext';
import { subscribeNewsletterInFirestore } from '../lib/firestoreService';

const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Founder', to: '/founder' },
  { label: 'Who We Serve', to: '/people' },
  { label: 'Progress', to: '/progress' },
  { label: 'Contact', to: '/contact' },
];

type HeaderSurfaceTheme = 'cream' | 'cream-dark' | 'navy';

function detectSectionTheme(el: Element): HeaderSurfaceTheme | null {
  const explicit = el.getAttribute('data-header-theme') as HeaderSurfaceTheme | null;
  if (explicit === 'navy' || explicit === 'cream' || explicit === 'cream-dark') {
    return explicit;
  }

  const cls = typeof el.className === 'string' ? el.className : '';
  if (
    cls.includes('bg-navy-luxury') ||
    cls.includes('bg-[#1A2A4A]') ||
    cls.includes('bg-[#111C33]')
  ) {
    return 'navy';
  }
  if (cls.includes('bg-[#EDE4CC]')) {
    return 'cream-dark';
  }
  if (cls.includes('bg-cream-luxury') || cls.includes('bg-[#F5EFE0]')) {
    return 'cream';
  }

  const bg = window.getComputedStyle(el).backgroundColor;
  if (bg === 'rgb(26, 42, 74)' || bg === 'rgb(17, 28, 51)') {
    return 'navy';
  }
  if (bg === 'rgb(237, 228, 204)') {
    return 'cream-dark';
  }
  if (bg === 'rgb(245, 239, 224)') {
    return 'cream';
  }

  return null;
}

export function Navbar() {
  const { user, profile, signOutUser, openLoginModal } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [surfaceTheme, setSurfaceTheme] = useState<HeaderSurfaceTheme>('navy');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const updateHeaderThemeOnScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const isScrolledDown = scrollY > 40;
    setScrolled(isScrolledDown);

    // Keep the header Navy Blue initially at the top of every page
    if (!isScrolledDown) {
      setSurfaceTheme('navy');
      return;
    }

    const headerHeight = headerRef.current?.offsetHeight || 76;
    const probeY = Math.min(window.innerHeight - 10, Math.max(headerHeight + 6, 40));

    // Inspect all semantic sections and footer to find which block currently sits under the navbar
    const candidates = Array.from(
      document.querySelectorAll('main section, main > div > section, footer')
    );

    for (const section of candidates) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= probeY && rect.bottom >= probeY) {
        const detected = detectSectionTheme(section);
        if (detected) {
          setSurfaceTheme(detected);
          return;
        }
      }
    }

    // Fallback: check elementsFromPoint at the horizontal center right below the header
    const hitElements = document.elementsFromPoint(window.innerWidth / 2, probeY);
    for (const el of hitElements) {
      if (headerRef.current && headerRef.current.contains(el)) continue;
      const detected = detectSectionTheme(el);
      if (detected) {
        setSurfaceTheme(detected);
        return;
      }
    }
  }, []);

  useEffect(() => {
    updateHeaderThemeOnScroll();
    // Run again after paint in case route content just mounted
    const timer = window.setTimeout(updateHeaderThemeOnScroll, 60);
    window.addEventListener('scroll', updateHeaderThemeOnScroll, { passive: true });
    window.addEventListener('resize', updateHeaderThemeOnScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', updateHeaderThemeOnScroll);
      window.removeEventListener('resize', updateHeaderThemeOnScroll);
    };
  }, [location.pathname, updateHeaderThemeOnScroll]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSupportClick = () => {
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById('funding-cta');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    navigate('/contact?reason=Partner+With+Us');
  };

  const handleSignOut = async () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    await signOutUser();
    navigate('/');
  };

  const firstName =
    (profile?.fullName || user?.displayName || profile?.email || 'Member').split(' ')[0];
  const avatarUrl = profile?.avatarUrl || user?.photoURL || '';
  const isAdmin = profile?.role === 'admin';
  const isNavy = surfaceTheme === 'navy';
  const isCreamDark = surfaceTheme === 'cream-dark';

  // Dynamic surface classes that align seamlessly with the active webpage section
  const headerSurfaceClasses = isNavy
    ? scrolled
      ? 'bg-[#1A2A4A]/95 text-white border-b border-[#C9A227]/70 shadow-luxury py-3'
      : 'bg-[#1A2A4A] text-white border-b border-[#C9A227]/35 py-4'
    : isCreamDark
      ? scrolled
        ? 'bg-[#EDE4CC]/95 text-[#1A2A4A] border-b border-[#C9A227] shadow-luxury py-3'
        : 'bg-[#EDE4CC] text-[#1A2A4A] border-b border-[#C9A227]/45 py-4'
      : scrolled
        ? 'bg-[#F5EFE0]/95 text-[#1A2A4A] border-b border-[#C9A227] shadow-luxury py-3'
        : 'bg-[#F5EFE0] text-[#1A2A4A] border-b border-[#C9A227]/35 py-4';

  const topRibbonClasses = isNavy
    ? 'bg-[#111C33] text-white/90 border-b border-[#C9A227]/35'
    : 'bg-[#1A2A4A] text-white/90 border-b border-[#C9A227]/40';

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-[#1A2A4A] focus:text-white focus:px-4 focus:py-2 focus:rounded focus:border-2 focus:border-[#C9A227]"
      >
        Skip to main content
      </a>

      {/* Top Editorial Ribbon — Aligned to max-w-[1200px] */}
      <div className={`${topRibbonClasses} text-xs py-2 transition-colors duration-300`}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A227] shrink-0" />
            <span className="font-medium tracking-wide">
              <strong className="text-[#E8C96A] uppercase tracking-wider">KalyanSetu:</strong>{' '}
              Serving 1-Grade Nourishment with Dignity &amp; Affordability
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] uppercase tracking-[1.8px] text-[#E8C96A]">
            <Link to="/progress" className="hover:text-white transition-colors">
              Pilot Roadmap
            </Link>
            <span aria-hidden="true" className="text-white/30">
              |
            </span>
            <Link to="/founder" className="hover:text-white transition-colors">
              Founder: Divyansh Rai
            </Link>
          </div>
        </div>
      </div>

      <header
        ref={headerRef}
        className={`sticky top-0 z-50 backdrop-blur-md transition-all duration-300 ${headerSurfaceClasses}`}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-6">
          {/* Zone 1: Brand Wordmark — switches between white & navy automatically */}
          <Link to="/" className="shrink-0 flex items-center" aria-label="KalyanSetu Home">
            <KalyanSetuLogo variant={isNavy ? 'white' : 'navy'} size="md" />
          </Link>

          {/* Zone 2: Center Navigation Links — perfectly centered and color-adaptive */}
          <nav
            className="hidden lg:flex items-center justify-center gap-7 flex-1"
            aria-label="Primary Navigation"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `relative py-1.5 text-[15px] tracking-wide whitespace-nowrap transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:bg-[#C9A227] after:transition-all after:duration-200 ${
                    isNavy
                      ? isActive
                        ? 'after:w-full font-bold text-[#E8C96A]'
                        : 'after:w-0 font-medium text-white/90 hover:text-[#E8C96A] hover:after:w-full'
                      : isActive
                        ? 'after:w-full font-bold text-[#1A2A4A]'
                        : 'after:w-0 font-medium text-[#1A2A4A] hover:text-[#C9A227] hover:after:w-full'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: Primary Actions — aligned right and color-adaptive */}
          <div className="hidden lg:flex items-center justify-end gap-3 shrink-0">
            {!user ? (
              <button
                type="button"
                onClick={openLoginModal}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg border-2 transition-all whitespace-nowrap cursor-pointer ${
                  isNavy
                    ? 'border-[#E8C96A] text-[#E8C96A] hover:bg-[#E8C96A] hover:text-[#1A2A4A]'
                    : 'border-[#1A2A4A] text-[#1A2A4A] hover:bg-[#1A2A4A] hover:text-white'
                }`}
              >
                <LogIn className="w-4 h-4 text-[#C9A227]" />
                <span>Sign in</span>
              </button>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  aria-haspopup="menu"
                  aria-expanded={dropdownOpen}
                  className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg border-2 border-[#C9A227] transition-colors whitespace-nowrap shadow-xs cursor-pointer ${
                    isNavy
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : 'bg-[#F5EFE0] text-[#1A2A4A] hover:bg-[#EDE4CC]'
                  }`}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={firstName}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover border border-[#C9A227]"
                    />
                  ) : (
                    <span
                      className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center ${
                        isNavy ? 'bg-[#C9A227] text-[#1A2A4A]' : 'bg-[#1A2A4A] text-[#E8C96A]'
                      }`}
                    >
                      {firstName.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="text-left">
                    <span className="block text-sm font-bold leading-tight max-w-[110px] truncate">
                      {firstName}
                    </span>
                    <span className="block text-[10px] uppercase tracking-wider text-[#C9A227] font-bold">
                      {isAdmin ? 'Admin' : 'Member'}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 ${isNavy ? 'text-[#E8C96A]' : 'text-[#1A2A4A]'}`}
                  />
                </button>

                {dropdownOpen && (
                  <div
                    role="menu"
                    aria-label="User account menu"
                    className="absolute right-0 mt-2 w-56 bg-[#F5EFE0] text-[#1A2A4A] border-2 border-[#C9A227] rounded-xl shadow-luxury py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-[#C9A227]/30 mb-1">
                      <p className="text-xs font-bold text-[#1A2A4A] truncate">
                        {profile?.fullName || user.displayName}
                      </p>
                      <p className="text-[11px] text-[#7A6A50] truncate">
                        {profile?.email || user.email}
                      </p>
                    </div>
                    <Link
                      to="/dashboard"
                      role="menuitem"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-[#1A2A4A] hover:bg-[#EDE4CC] transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#C9A227]" />
                      <span>My Dashboard</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        role="menuitem"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-[#1A2A4A] hover:bg-[#EDE4CC] transition-colors"
                      >
                        <Shield className="w-4 h-4 text-[#C9A227]" />
                        <span>Admin Command Center</span>
                      </Link>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 text-left px-4 py-2.5 text-sm font-medium text-[#7A6A50] hover:bg-[#EDE4CC] hover:text-[#1A2A4A] border-t border-[#C9A227]/30 mt-1 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={handleSupportClick}
              className="px-6 py-2.5 text-sm font-bold bg-[#C9A227] text-white rounded-lg hover:bg-[#b38f20] shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-[0.98] whitespace-nowrap cursor-pointer"
            >
              Support Our Mission
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            className={`lg:hidden p-2 rounded-lg border transition-colors ${
              isNavy
                ? 'text-white border-[#C9A227]/60 hover:text-[#E8C96A]'
                : 'text-[#1A2A4A] border-[#C9A227]/50 hover:text-[#C9A227]'
            }`}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Full-Height Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-[#111C33]/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-80 max-w-[85vw] bg-[#F5EFE0] h-full shadow-2xl border-l-2 border-[#C9A227] flex flex-col justify-between p-6 z-10 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#C9A227]">
                <KalyanSetuLogo variant="navy" size="sm" />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="p-2 text-[#1A2A4A] hover:text-[#C9A227]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="mt-4 flex flex-col" aria-label="Mobile Navigation">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `py-3.5 text-base font-medium border-b border-[#C9A227]/35 transition-colors ${
                        isActive ? 'text-[#C9A227] font-bold' : 'text-[#1A2A4A] hover:text-[#C9A227]'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="pt-6 flex flex-col gap-3">
              {!user ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openLoginModal();
                  }}
                  className="w-full py-3 text-center text-sm font-bold text-[#1A2A4A] border-2 border-[#1A2A4A] rounded-lg hover:bg-[#1A2A4A] hover:text-white transition-colors"
                >
                  Sign in with Google
                </button>
              ) : (
                <div className="flex flex-col gap-2 border-t border-[#C9A227]/40 pt-3">
                  <Link
                    to="/dashboard"
                    className="py-2 text-sm font-bold text-[#1A2A4A] hover:text-[#C9A227]"
                  >
                    Dashboard ({firstName})
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="py-2 text-sm font-bold text-[#C9A227] hover:underline"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="py-2 text-left text-sm text-[#7A6A50] hover:text-[#1A2A4A]"
                  >
                    Sign out
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleSupportClick}
                className="w-full py-3.5 text-center text-sm font-bold bg-[#C9A227] text-white rounded-lg hover:bg-[#b38f20] transition-colors"
              >
                Support Our Mission
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function Footer() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const trimmed = email.trim();
    if (!trimmed || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
      setFeedback({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }
    setSubmitting(true);
    try {
      const result = await subscribeNewsletterInFirestore(trimmed);
      if (result.alreadySubscribed) {
        setFeedback({ type: 'success', text: "You're already subscribed." });
      } else {
        setFeedback({ type: 'success', text: 'Thank you for subscribing to our updates!' });
        setEmail('');
      }
    } catch {
      setFeedback({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer
      data-header-theme="navy"
      className="bg-navy-luxury text-white pt-16 pb-10 border-t-2 border-[#C9A227]"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12">
          {/* Column 1 — Brand (5 cols) */}
          <div className="md:col-span-5">
            <KalyanSetuLogo variant="white" size="md" />
            <p className="font-garamond italic text-2xl text-[#E8C96A] mt-3">
              Serving Nourishment, Building Connection
            </p>
            <p className="text-white/85 text-[15px] leading-relaxed mt-3 max-w-sm">
              A for-profit social impact company committed to making 1-grade, hygienic, and
              nourishing food accessible to everyone across India.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/5 border border-[#C9A227]/30 text-xs text-[#E8C96A]">
              <span>NIC Code: 56100 · Food &amp; Community Nourishment</span>
            </div>
            <p className="text-white/60 text-sm mt-5">
              © 2026 KalyanSetu. All rights reserved.
            </p>
          </div>

          {/* Column 2 — Navigate (3 cols) */}
          <div className="md:col-span-3">
            <h3 className="font-body text-[13px] font-bold uppercase tracking-[2.5px] text-[#C9A227] mb-5">
              NAVIGATE
            </h3>
            <ul className="space-y-2.5">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-white/90 hover:text-[#E8C96A] text-[15px] transition-colors inline-flex items-center gap-1.5"
                  >
                    <span className="text-[#C9A227] text-xs">›</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/login"
                  className="text-white/90 hover:text-[#E8C96A] text-[15px] transition-colors inline-flex items-center gap-1.5"
                >
                  <span className="text-[#C9A227] text-xs">›</span>
                  <span>Member Sign-In</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/login"
                  className="text-white/75 hover:text-[#E8C96A] text-sm transition-colors inline-flex items-center gap-1.5"
                >
                  <span className="text-[#C9A227] text-xs">›</span>
                  <span>Admin Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 — Connect & Newsletter (4 cols) */}
          <div className="md:col-span-4">
            <h3 className="font-body text-[13px] font-bold uppercase tracking-[2.5px] text-[#C9A227] mb-5">
              CONNECT WITH US
            </h3>
            <p className="text-white/90 text-[15px]">
              <span className="text-[#E8C96A] font-semibold">Founder:</span> Divyansh Rai
            </p>
            <p className="text-white/75 text-xs mt-0.5">Central University of Kerala</p>
            <p className="text-white/85 text-[15px] mt-2">
              <a
                href="mailto:rdivyansh088@gmail.com"
                className="hover:text-[#E8C96A] underline underline-offset-4 transition-colors"
              >
                rdivyansh088@gmail.com
              </a>
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4 mt-4">
              <a
                href="https://www.instagram.com/builtbydivyanshh?stkn=ZGhucHkzanRsMGZv"
                target="_blank"
                rel="noreferrer"
                aria-label="Divyansh Rai / KalyanSetu on Instagram"
                className="w-9 h-9 rounded-full bg-white/5 border border-[#C9A227]/40 flex items-center justify-center text-[#C9A227] hover:bg-[#C9A227] hover:text-[#1A2A4A] transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                </svg>
              </a>
              <a
                href="https://in.linkedin.com/in/divyansh-rai-76907236a"
                target="_blank"
                rel="noreferrer"
                aria-label="Divyansh Rai on LinkedIn"
                className="w-9 h-9 rounded-full bg-white/5 border border-[#C9A227]/40 flex items-center justify-center text-[#C9A227] hover:bg-[#C9A227] hover:text-[#1A2A4A] transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>

            {/* Newsletter Subscription */}
            <form
              onSubmit={handleNewsletterSubmit}
              className="mt-6 p-4 rounded-xl bg-white/5 border border-[#C9A227]/40"
            >
              <label
                htmlFor="footer-newsletter-email"
                className="block text-xs font-bold uppercase tracking-wider text-[#E8C96A] mb-2"
              >
                Stay updated on our pilot journey
              </label>
              <div className="flex items-stretch gap-2">
                <input
                  id="footer-newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 min-w-0 bg-white/10 border border-[#C9A227]/60 rounded-lg px-3.5 py-2 text-sm text-white placeholder:text-white/50 focus:bg-white/15"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#C9A227] hover:bg-[#b38f20] text-white font-bold text-sm px-4 py-2 rounded-lg inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 disabled:opacity-60 cursor-pointer"
                >
                  <span>{submitting ? 'Saving…' : 'Subscribe'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              {feedback && (
                <p
                  role="status"
                  aria-live="polite"
                  className={`mt-2 text-xs flex items-center gap-1.5 ${
                    feedback.type === 'success' ? 'text-[#E8C96A]' : 'text-red-300'
                  }`}
                >
                  {feedback.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                  <span>{feedback.text}</span>
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="pt-6 border-t border-[#C9A227]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p className="font-garamond italic text-xl text-[#E8C96A]">
            &ldquo;Good food is not a luxury, it is a right.&rdquo;
          </p>
          <div className="flex items-center gap-4 text-white/80">
            <Link to="/privacy" className="hover:text-[#E8C96A] transition-colors">
              Privacy Policy
            </Link>
            <span aria-hidden="true" className="text-[#C9A227]">
              ◆
            </span>
            <Link to="/terms" className="hover:text-[#E8C96A] transition-colors">
              Terms of Use
            </Link>
            <span aria-hidden="true" className="text-[#C9A227]">
              ◆
            </span>
            <Link to="/contact" className="hover:text-[#E8C96A] transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
