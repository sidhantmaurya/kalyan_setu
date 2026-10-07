import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  X,
  Lock,
  MessageSquareHeart,
} from 'lucide-react';
import {
  KalyanSetuLogo,
  GoogleGLogo,
  HERO_IMAGE_PATH,
  ResilientImage,
} from '../components/BrandVisuals';
import { useAuth } from '../context/AuthContext';

function getSafeNextPath(rawNext: string | null, fallback: string): string {
  if (!rawNext) return fallback;
  if (rawNext.startsWith('/') && !rawNext.startsWith('//')) {
    return rawNext;
  }
  return fallback;
}

export function WelcomeLoginModal() {
  const { user, loading, loginModalOpen, closeLoginModal, signInWithGoogle } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [signingIn, setSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Do not show the popup overlay if the user is already on the dedicated /login or /admin/login page
  const isDedicatedAuthRoute =
    location.pathname === '/login' ||
    location.pathname === '/admin/login' ||
    location.pathname === '/auth/callback';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && loginModalOpen) {
        closeLoginModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loginModalOpen, closeLoginModal]);

  if (loading || user || !loginModalOpen || isDedicatedAuthRoute) {
    return null;
  }

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSigningIn(true);
    try {
      const profile = await signInWithGoogle();
      closeLoginModal();
      if (profile?.role === 'admin') {
        navigate('/admin');
      }
    } catch {
      setErrorMsg("We couldn't complete Google Sign-In. Please try again.");
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6 bg-[#111C33]/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-login-title"
    >
      {/* Backdrop click to dismiss if desired */}
      <div
        className="fixed inset-0"
        onClick={closeLoginModal}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-[880px] bg-[#F5EFE0] border-2 border-[#C9A227] rounded-2xl shadow-luxury-lg overflow-hidden animate-modal-pop my-auto">
        {/* Top Ornamental Gold Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#1A2A4A] via-[#C9A227] to-[#1A2A4A]" />

        {/* Close / Skip button */}
        <button
          type="button"
          onClick={closeLoginModal}
          aria-label="Continue to website without signing in"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-[#1A2A4A]/10 hover:bg-[#1A2A4A] text-[#1A2A4A] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column — Editorial Brand Story & Imagery (5 cols on desktop) */}
          <div className="hidden lg:flex lg:col-span-5 bg-navy-luxury text-white p-8 flex-col justify-between relative overflow-hidden border-r border-[#C9A227]/40">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A227]/15 border border-[#C9A227]/40 text-[#E8C96A] text-[11px] font-bold uppercase tracking-[2px] mb-6">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Social Impact Initiative</span>
              </div>

              <KalyanSetuLogo variant="white" size="md" />

              <p className="font-garamond italic text-2xl text-[#E8C96A] mt-4 leading-snug">
                &ldquo;Good food should not be a luxury — it is dignity, energy, and hope.&rdquo;
              </p>

              <p className="text-white/80 text-sm leading-relaxed mt-3">
                Join our community of students, partners, supporters, and changemakers building
                affordable, 1-grade quality nourishment across India.
              </p>
            </div>

            <div className="my-6 rounded-xl overflow-hidden border border-[#C9A227]/50 shadow-md relative">
              <ResilientImage
                src={HERO_IMAGE_PATH}
                alt="Freshly served nourishing Indian thali meal"
                className="w-full h-36 object-cover"
              />
              <div className="bg-[#111C33]/90 px-3.5 py-2 text-[11px] text-[#E8C96A] font-medium flex items-center justify-between">
                <span>1-Grade Quality Nourishment</span>
                <span className="uppercase tracking-wider text-white/70">Pilot Stage</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#C9A227]/30 flex items-center justify-between text-xs text-white/75">
              <span>Founder: Divyansh Rai</span>
              <span className="text-[#E8C96A]">Central University of Kerala</span>
            </div>
          </div>

          {/* Right Column — Sign-In Portal (7 cols on desktop) */}
          <div className="lg:col-span-7 p-7 sm:p-10 flex flex-col justify-between bg-[#F5EFE0]">
            <div>
              <div className="flex items-center justify-between lg:hidden mb-5">
                <KalyanSetuLogo variant="navy" size="sm" />
              </div>

              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[2.5px] text-[#C9A227] mb-2">
                <span>WELCOME PORTAL</span>
                <span aria-hidden="true">◆</span>
                <span>MEMBER &amp; SUPPORTER ACCESS</span>
              </div>

              <h2
                id="welcome-login-title"
                className="font-serif-heading text-3xl sm:text-4xl font-bold text-[#1A2A4A] leading-tight mb-3"
              >
                Sign in to KalyanSetu
              </h2>

              <p className="text-[#7A6A50] text-[15px] leading-relaxed mb-6">
                Connect with your Google account to unlock your personal dashboard, prefill contact
                inquiries, and track your direct conversations with our founder.
              </p>

              {/* Primary Google Sign-In CTA */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={signingIn}
                className="w-full bg-[#1A2A4A] hover:bg-[#111C33] text-white font-bold py-4 px-6 rounded-lg border-2 border-[#C9A227] flex items-center justify-center gap-3.5 shadow-luxury transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-60 cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0">
                  <GoogleGLogo className="w-4 h-4" />
                </div>
                <span className="text-base tracking-wide">
                  {signingIn ? 'Connecting with Google…' : 'Continue with Google'}
                </span>
                <ArrowRight className="w-4 h-4 text-[#E8C96A] transition-transform group-hover:translate-x-1" />
              </button>

              {errorMsg && (
                <div
                  role="status"
                  aria-live="polite"
                  className="mt-4 p-3.5 rounded-lg bg-red-50 border border-red-300 text-red-900 text-sm flex items-center gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Value Pillars of Signing In */}
              <div className="mt-6 pt-6 border-t border-[#C9A227]/30 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A227] shrink-0 mt-1" />
                  <p className="text-xs sm:text-sm text-[#3D3520]">
                    <strong className="text-[#1A2A4A]">One-Click Member Profile:</strong> No
                    passwords to remember — verified securely via Google OAuth &amp; Firebase.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <MessageSquareHeart className="w-4 h-4 text-[#C9A227] shrink-0 mt-1" />
                  <p className="text-xs sm:text-sm text-[#3D3520]">
                    <strong className="text-[#1A2A4A]">Direct Founder Conversations:</strong> Keep
                    a complete record of your partnership, investment, or support messages.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-[#C9A227] shrink-0 mt-1" />
                  <p className="text-xs sm:text-sm text-[#3D3520]">
                    <strong className="text-[#1A2A4A]">Strict Privacy Guarantee:</strong> We never
                    post or share your data. Used solely to communicate with you.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Guest Browse + Admin Link */}
            <div className="mt-7 pt-5 border-t border-[#C9A227]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={closeLoginModal}
                className="w-full sm:w-auto px-5 py-2.5 rounded-md bg-[#EDE4CC] hover:bg-[#e3d6b4] text-[#1A2A4A] font-bold text-xs uppercase tracking-wider border border-[#C9A227]/50 transition-colors cursor-pointer"
              >
                Explore Website as Guest →
              </button>

              <div className="flex items-center gap-3 text-xs text-[#7A6A50]">
                <Link
                  to="/admin/login"
                  onClick={closeLoginModal}
                  className="inline-flex items-center gap-1 font-bold text-[#1A2A4A] hover:text-[#C9A227] transition-colors"
                >
                  <Lock className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Admin Sign-In</span>
                </Link>
                <span aria-hidden="true">·</span>
                <Link
                  to="/privacy"
                  onClick={closeLoginModal}
                  className="hover:text-[#1A2A4A] underline"
                >
                  Privacy
                </Link>
                <span aria-hidden="true">·</span>
                <Link
                  to="/terms"
                  onClick={closeLoginModal}
                  className="hover:text-[#1A2A4A] underline"
                >
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const nextPath = getSafeNextPath(searchParams.get('next'), '/dashboard');

  useEffect(() => {
    if (!loading && user) {
      navigate(nextPath, { replace: true });
    }
  }, [loading, user, navigate, nextPath]);

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSigningIn(true);
    try {
      await signInWithGoogle();
      navigate(nextPath, { replace: true });
    } catch {
      setErrorMsg("We couldn't sign you in. Please try again.");
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-120px)] bg-cream-luxury flex items-center justify-center px-4 py-12 sm:py-20">
      <div className="w-full max-w-[920px] bg-[#F5EFE0] border-2 border-[#C9A227] rounded-2xl shadow-luxury-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Luxury Editorial Panel */}
        <div className="lg:col-span-5 bg-navy-luxury text-white p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#C9A227]/40">
          <div>
            <span className="inline-block text-[11px] font-bold uppercase tracking-[2.5px] text-[#E8C96A] mb-4">
              KALYANSETU MEMBER PORTAL
            </span>
            <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-white leading-snug mb-4">
              Serving Nourishment, Building Connection.
            </h2>
            <p className="font-garamond italic text-xl text-[#E8C96A] leading-relaxed mb-6">
              &ldquo;Because no one should have to go without a nourishing meal simply because they
              cannot afford it.&rdquo;
            </p>
          </div>

          <div className="space-y-4 pt-6 border-t border-[#C9A227]/30 text-sm text-white/85">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#C9A227] shrink-0" />
              <span>Verified Google Authentication</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#C9A227] shrink-0" />
              <span>Instant Firebase Cloud Sync</span>
            </div>
          </div>
        </div>

        {/* Right Sign-In Action Panel */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-[#F5EFE0]">
          <div className="mb-6">
            <KalyanSetuLogo variant="navy" size="md" />
          </div>

          <h1 className="font-serif-heading text-3xl sm:text-4xl font-bold text-[#1A2A4A] mb-3">
            Welcome to KalyanSetu
          </h1>
          <p className="text-[#7A6A50] text-base leading-relaxed mb-8">
            Sign in with Google to send messages faster, manage your profile, and keep track of
            your conversations with our founder.
          </p>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={signingIn}
            className="w-full bg-[#1A2A4A] hover:bg-[#111C33] text-white font-bold py-4 px-6 rounded-lg border-2 border-[#C9A227] flex items-center justify-center gap-3.5 shadow-luxury transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0">
              <GoogleGLogo className="w-4 h-4" />
            </div>
            <span className="text-base">
              {signingIn ? 'Signing in…' : 'Continue with Google'}
            </span>
          </button>

          {errorMsg && (
            <div
              role="status"
              aria-live="polite"
              className="mt-5 p-3.5 rounded-lg bg-red-50 border border-red-300 text-red-900 text-sm flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-[#C9A227]/30 flex flex-wrap items-center justify-between gap-4 text-xs text-[#7A6A50]">
            <p>
              By continuing you agree to our{' '}
              <Link to="/terms" className="text-[#1A2A4A] font-bold underline">
                Terms of Use
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-[#1A2A4A] font-bold underline">
                Privacy Policy
              </Link>
              .
            </p>
            <Link
              to="/admin/login"
              className="font-bold text-[#1A2A4A] hover:text-[#C9A227] inline-flex items-center gap-1"
            >
              <Lock className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AdminLoginPage() {
  const { user, profile, loading, signInWithGoogle, signOutUser } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  // Add noindex, nofollow meta tag (Section 12.2)
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === 'admin') {
        navigate('/admin', { replace: true });
      }
    }
  }, [loading, user, profile, navigate]);

  const handleAdminSignIn = async () => {
    setErrorMsg(null);
    setSigningIn(true);
    try {
      const syncedProfile = await signInWithGoogle();
      if (syncedProfile && syncedProfile.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        await signOutUser();
        setErrorMsg('This Google account is not authorised for admin access.');
      }
    } catch {
      setErrorMsg("We couldn't sign you in. Please try again.");
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-120px)] bg-navy-luxury flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-[460px] bg-[#1A2A4A]/95 border-2 border-[#C9A227] rounded-2xl p-8 sm:p-11 text-center shadow-luxury-lg">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C9A227]/15 border border-[#C9A227]/40 text-[#E8C96A] text-xs font-bold uppercase tracking-[2px] mb-6">
          <Lock className="w-3.5 h-3.5 text-[#C9A227]" />
          <span>Restricted Access</span>
        </div>

        <div className="flex justify-center mb-6">
          <KalyanSetuLogo variant="white" size="md" />
        </div>

        <h1 className="font-serif-heading text-3xl font-bold text-white mb-2">
          Admin Sign-in
        </h1>
        <p className="font-garamond italic text-xl text-[#E8C96A] mb-8">
          Authorised KalyanSetu team members only.
        </p>

        <button
          type="button"
          onClick={handleAdminSignIn}
          disabled={signingIn}
          className="w-full bg-[#C9A227] hover:bg-[#b38f20] text-white font-bold py-4 px-5 rounded-lg flex items-center justify-center gap-3 shadow-md transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0">
            <GoogleGLogo className="w-4 h-4" />
          </div>
          <span>{signingIn ? 'Verifying Credentials…' : 'Continue with Google'}</span>
        </button>

        {errorMsg && (
          <div
            role="status"
            aria-live="polite"
            className="mt-5 p-3.5 rounded-lg bg-red-950/80 border border-red-400 text-red-200 text-sm flex items-center justify-center gap-2 text-left"
          >
            <AlertCircle className="w-4 h-4 text-red-300 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="mt-8 pt-5 border-t border-[#C9A227]/25">
          <Link
            to="/"
            className="text-xs font-bold uppercase tracking-widest text-[#E8C96A] hover:text-white transition-colors"
          >
            ← Return to Public Website
          </Link>
        </div>
      </div>
    </section>
  );
}

export function AuthCallbackPage() {
  const { user, profile, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    const rawNext = searchParams.get('next');
    if (rawNext) {
      navigate(getSafeNextPath(rawNext, '/dashboard'), { replace: true });
      return;
    }
    if (user && profile?.role === 'admin') {
      navigate('/admin', { replace: true });
      return;
    }
    if (user) {
      navigate('/dashboard', { replace: true });
      return;
    }
    navigate('/login', { replace: true });
  }, [loading, user, profile, searchParams, navigate]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[#F5EFE0] text-[#1A2A4A]">
      <p className="font-serif-heading text-xl">Completing sign-in…</p>
    </div>
  );
}
