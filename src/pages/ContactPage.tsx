import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  Send,
  MailOpen,
  Clock,
  Lock,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CONTACT_REASONS } from '../data/kalyansetuData';
import { FounderAvatarBlock, SectionLabel, StepFlow } from '../components/ReusableBlocks';
import { GoogleGLogo } from '../components/BrandVisuals';
import { submitContactMessageToFirestore } from '../lib/firestoreService';

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function ContactPage() {
  const { user, profile, signInWithGoogle, openLoginModal } = useAuth();
  const [searchParams] = useSearchParams();

  const initialReasonParam = searchParams.get('reason') || '';
  const defaultReason = CONTACT_REASONS.includes(initialReasonParam as any)
    ? initialReasonParam
    : 'General Inquiry';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState(defaultReason);
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(''); // Honeypot

  const [signingInInline, setSigningInInline] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Prefill from Google profile when signed in
  useEffect(() => {
    if (profile || user) {
      setFullName((prev) => prev || profile?.fullName || user?.displayName || '');
      setEmail(profile?.email || user?.email || '');
      setPhone((prev) => prev || profile?.phone || '');
    } else {
      setFullName('');
      setEmail('');
      setPhone('');
    }
  }, [profile, user]);

  useEffect(() => {
    const param = searchParams.get('reason');
    if (param && CONTACT_REASONS.includes(param as any)) {
      setReason(param);
    }
  }, [searchParams]);

  const handleInlineGoogleSignIn = async () => {
    setSubmitStatus(null);
    setSigningInInline(true);
    try {
      await signInWithGoogle();
    } catch {
      setSubmitStatus({
        type: 'error',
        text: "We couldn't sign you in with Google. Please try again.",
      });
    } finally {
      setSigningInInline(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus(null);

    // Strict login requirement check before allowing submission
    if (!user) {
      openLoginModal();
      setSubmitStatus({
        type: 'error',
        text: 'Please sign in with your Google account first to fill and submit the contact form.',
      });
      return;
    }

    // Honeypot check (Section 15.5)
    if (website.trim().length > 0) {
      setSubmitStatus({
        type: 'success',
        text: "Thank you! We'll read this carefully and get back to you soon.",
      });
      return;
    }

    const cleanName = fullName.trim();
    const cleanEmail = (user.email || email).trim();
    const cleanPhone = phone.trim();
    const cleanMessage = message.trim();

    if (cleanName.length < 2 || cleanName.length > 100) {
      setSubmitStatus({
        type: 'error',
        text: 'Full Name must be between 2 and 100 characters.',
      });
      return;
    }
    if (!EMAIL_REGEX.test(cleanEmail) || cleanEmail.length > 160) {
      setSubmitStatus({
        type: 'error',
        text: 'Please provide a valid email address.',
      });
      return;
    }
    if (cleanPhone.length > 20) {
      setSubmitStatus({
        type: 'error',
        text: 'Phone number cannot exceed 20 characters.',
      });
      return;
    }
    if (cleanMessage.length < 10 || cleanMessage.length > 5000) {
      setSubmitStatus({
        type: 'error',
        text: 'Message must be between 10 and 5000 characters.',
      });
      return;
    }
    if (!consent) {
      setSubmitStatus({
        type: 'error',
        text: 'Please agree to the privacy consent checkbox.',
      });
      return;
    }

    setSubmitting(true);
    try {
      await submitContactMessageToFirestore({
        userId: user.uid,
        fullName: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        reason,
        message: cleanMessage,
      });

      setSubmitStatus({
        type: 'success',
        text: "Thank you! We'll read this carefully and get back to you soon.",
      });
      setMessage('');
      setConsent(false);
    } catch {
      setSubmitStatus({
        type: 'error',
        text: 'Something went wrong. Please try again or email us directly.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isLocked = !user;

  return (
    <div>
      {/* C1 — Page Hero */}
      <section
        data-header-theme="navy"
        className="bg-navy-luxury text-white py-20 md:py-28 px-4 sm:px-6 text-center border-b-2 border-[#C9A227]"
      >
        <div className="max-w-[900px] mx-auto">
          <SectionLabel centered>CONNECT WITH KALYANSETU</SectionLabel>
          <h1 className="font-serif-heading text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Let&apos;s Build Something Meaningful Together
          </h1>
          <p className="font-garamond italic text-2xl sm:text-3xl text-[#E8C96A]">
            Whether you want to partner, support, invest, or simply say hello.
          </p>
        </div>
      </section>

      {/* C2 & C3 — Contact Form + Founder Contact Card */}
      <section
        data-header-theme="cream"
        className="bg-cream-luxury py-16 md:py-24 px-4 sm:px-6"
      >
        <div className="max-w-[1150px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-[#EDE4CC] border-2 border-[#C9A227] rounded-2xl p-6 sm:p-10 shadow-luxury relative overflow-hidden">
            <SectionLabel>SEND A MESSAGE</SectionLabel>
            <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#1A2A4A] mb-3">
              Write to KalyanSetu
            </h2>

            {/* Sign-In Gate vs Verified Member Banner */}
            {isLocked ? (
              <div className="mb-7 p-6 rounded-2xl bg-navy-luxury text-white border-2 border-[#C9A227] shadow-luxury">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#C9A227]/20 border border-[#C9A227] text-[#E8C96A] flex items-center justify-center shrink-0 mt-0.5">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="inline-block text-[11px] font-bold uppercase tracking-[2px] text-[#E8C96A] mb-1">
                      SIGN-IN REQUIRED TO FILL CONTACT FORM
                    </span>
                    <h3 className="font-serif-heading text-xl font-bold text-white mb-1.5">
                      Please sign in first to send a message
                    </h3>
                    <p className="text-white/85 text-sm leading-relaxed mb-5">
                      To ensure authentic conversations and let you track replies in your personal
                      dashboard, please sign in with your Google account to unlock the contact form
                      below.
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={handleInlineGoogleSignIn}
                        disabled={signingInInline}
                        className="inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-[#C9A227] hover:bg-[#b38f20] text-white font-bold text-sm shadow-md transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0">
                          <GoogleGLogo className="w-3.5 h-3.5" />
                        </div>
                        <span>
                          {signingInInline
                            ? 'Signing in…'
                            : 'Continue with Google to Unlock Form'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={openLoginModal}
                        className="px-4 py-3 rounded-lg border border-[#E8C96A]/60 text-[#E8C96A] hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Open Login Portal
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 rounded-xl bg-[#F5EFE0] border border-[#C9A227] flex flex-wrap items-center justify-between gap-3 text-sm text-[#1A2A4A] shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#C9A227] shrink-0" />
                  <span>
                    <strong>Form Unlocked:</strong> Signed in as{' '}
                    <span className="text-[#7A6A50] font-semibold">
                      {profile?.email || user?.email}
                    </span>
                  </span>
                </div>
                <Link
                  to="/dashboard"
                  className="text-xs font-bold uppercase tracking-wider text-[#1A2A4A] underline underline-offset-4 hover:text-[#C9A227]"
                >
                  View Past Messages →
                </Link>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 relative" noValidate>
              {/* Hidden Honeypot field (Section 10 C2 & Section 21) */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="contact-website-hp">Website</label>
                <input
                  id="contact-website-hp"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <fieldset
                disabled={isLocked || submitting}
                onClick={() => {
                  if (isLocked) openLoginModal();
                }}
                className={`space-y-5 transition-opacity duration-200 ${
                  isLocked ? 'opacity-55 select-none cursor-not-allowed' : 'opacity-100'
                }`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="contact-full-name"
                      className="block text-sm font-bold text-[#1A2A4A] mb-1.5"
                    >
                      Full Name <span className="text-[#C9A227]">*</span>
                    </label>
                    <input
                      id="contact-full-name"
                      type="text"
                      required
                      minLength={2}
                      maxLength={100}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={isLocked ? 'Sign in to unlock' : 'Your full name'}
                      className="w-full bg-[#F5EFE0] border border-[#C9A227]/60 rounded-lg px-4 py-2.5 text-[#3D3520] focus:bg-white disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-sm font-bold text-[#1A2A4A] mb-1.5"
                    >
                      Email Address <span className="text-[#C9A227]">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      maxLength={160}
                      readOnly={true}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={isLocked ? 'Sign in to unlock' : 'you@example.com'}
                      className="w-full bg-[#EDE4CC]/70 border border-[#C9A227]/60 rounded-lg px-4 py-2.5 text-[#7A6A50] cursor-not-allowed"
                    />
                    {user && (
                      <span className="block text-xs text-[#7A6A50] mt-1">
                        Verified via your signed-in Google account
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="contact-phone"
                      className="block text-sm font-bold text-[#1A2A4A] mb-1.5"
                    >
                      Phone Number{' '}
                      <span className="text-xs font-normal text-[#7A6A50]">(optional)</span>
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      maxLength={20}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={isLocked ? 'Sign in to unlock' : '+91 98765 43210'}
                      className="w-full bg-[#F5EFE0] border border-[#C9A227]/60 rounded-lg px-4 py-2.5 text-[#3D3520] focus:bg-white disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-reason"
                      className="block text-sm font-bold text-[#1A2A4A] mb-1.5"
                    >
                      Reason for Contact <span className="text-[#C9A227]">*</span>
                    </label>
                    <select
                      id="contact-reason"
                      required
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full bg-[#F5EFE0] border border-[#C9A227]/60 rounded-lg px-4 py-2.5 text-[#3D3520] focus:bg-white disabled:cursor-not-allowed"
                    >
                      {CONTACT_REASONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="contact-message"
                      className="block text-sm font-bold text-[#1A2A4A]"
                    >
                      Message <span className="text-[#C9A227]">*</span>
                    </label>
                    <span className="text-xs text-[#7A6A50] tabular-nums">
                      {message.length} / 5000
                    </span>
                  </div>
                  <textarea
                    id="contact-message"
                    required
                    minLength={10}
                    maxLength={5000}
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      isLocked
                        ? 'Please sign in with Google above to write your message to KalyanSetu...'
                        : "Tell us what's on your mind..."
                    }
                    className="w-full bg-[#F5EFE0] border border-[#C9A227]/60 rounded-lg px-4 py-3 text-[#3D3520] focus:bg-white disabled:cursor-not-allowed"
                  />
                </div>

                {/* Consent Checkbox (Section 10 C2 & 14.5) */}
                <div className="flex items-start gap-3 pt-1">
                  <input
                    id="contact-consent"
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-[#1A2A4A] rounded shrink-0 disabled:cursor-not-allowed"
                  />
                  <label htmlFor="contact-consent" className="text-sm text-[#3D3520] leading-snug">
                    I agree that KalyanSetu may use these details to reply to me. We use your
                    details only to reply to your message. See our{' '}
                    <Link
                      to="/privacy"
                      className="text-[#1A2A4A] font-bold underline underline-offset-2 hover:text-[#C9A227]"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>
              </fieldset>

              {submitStatus && (
                <div
                  role="status"
                  aria-live="polite"
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    submitStatus.type === 'success'
                      ? 'bg-[#F5EFE0] border-[#C9A227] text-[#1A2A4A]'
                      : 'bg-red-50 border-red-300 text-red-900'
                  }`}
                >
                  {submitStatus.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-[#C9A227] shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                  )}
                  <span className="text-sm font-medium">{submitStatus.text}</span>
                </div>
              )}

              {isLocked ? (
                <button
                  type="button"
                  onClick={openLoginModal}
                  className="w-full sm:w-auto px-9 py-4 bg-[#1A2A4A] hover:bg-[#111C33] text-white font-bold rounded-lg border-2 border-[#C9A227] inline-flex items-center justify-center gap-2.5 shadow-luxury transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-[#E8C96A]" />
                  <span>Sign In Required to Send Message</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-9 py-4 bg-[#C9A227] text-white font-bold rounded-lg hover:bg-[#b38f20] shadow-luxury transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? 'Sending…' : 'Send Message →'}
                </button>
              )}
            </form>
          </div>

          {/* Right: C3 Founder Contact Card (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#F5EFE0] border-2 border-[#C9A227] rounded-2xl p-8 text-center shadow-luxury">
              <FounderAvatarBlock
                size="sm"
                showUniversity={true}
                quote='"Every conversation gets my personal attention."'
              />
              <div className="mt-6 pt-6 border-t border-[#C9A227]/30 text-sm text-[#7A6A50] space-y-3">
                <p>
                  Direct Email:{' '}
                  <a
                    href="mailto:rdivyansh088@gmail.com"
                    className="font-bold text-[#1A2A4A] underline underline-offset-4 hover:text-[#C9A227]"
                  >
                    rdivyansh088@gmail.com
                  </a>
                </p>
                <div className="flex items-center justify-center gap-3 pt-1">
                  <a
                    href="https://in.linkedin.com/in/divyansh-rai-76907236a"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-lg bg-[#1A2A4A] text-[#E8C96A] hover:bg-[#C9A227] hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    LinkedIn
                  </a>
                  <a
                    href="https://www.instagram.com/builtbydivyanshh?stkn=ZGhucHkzanRsMGZv"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-lg border border-[#1A2A4A] text-[#1A2A4A] hover:bg-[#1A2A4A] hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Instagram
                  </a>
                </div>
                <p className="text-xs pt-1">
                  NIC Code: 56100 · Restaurants &amp; Mobile Food Service Activities
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* C4 — What Happens Next */}
      <section
        data-header-theme="cream-dark"
        className="bg-[#EDE4CC] py-16 md:py-20 px-4 sm:px-6"
      >
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-10">
            <SectionLabel centered>WHAT HAPPENS NEXT</SectionLabel>
            <h2 className="font-serif-heading text-3xl font-bold text-[#1A2A4A]">
              From your message to a personal reply
            </h2>
          </div>

          <StepFlow
            steps={[
              {
                icon: <Send className="w-5 h-5" />,
                title: 'Step 1: You sign in & send a message',
                description:
                  'Your verified message is saved securely in Firebase Firestore and the founder receives an instant notification.',
              },
              {
                icon: <MailOpen className="w-5 h-5" />,
                title: 'Step 2: Divyansh reads it personally',
                description:
                  'Every inquiry, partnership idea, or note is reviewed directly by the founder.',
              },
              {
                icon: <Clock className="w-5 h-5" />,
                title: 'Step 3: You hear back within 48 hours',
                description:
                  'We respond directly to your verified Google email address to continue the conversation.',
              },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
