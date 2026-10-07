import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Send, MailOpen, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CONTACT_REASONS } from '../data/kalyansetuData';
import { FounderAvatarBlock, SectionLabel, StepFlow } from '../components/ReusableBlocks';
import { submitContactMessageToFirestore } from '../lib/firestoreService';

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function ContactPage() {
  const { user, profile, openLoginModal } = useAuth();
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

  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Prefill from Google profile if signed in (Section C2)
  useEffect(() => {
    if (profile || user) {
      setFullName((prev) => prev || profile?.fullName || user?.displayName || '');
      setEmail(profile?.email || user?.email || '');
      setPhone((prev) => prev || profile?.phone || '');
    }
  }, [profile, user]);

  useEffect(() => {
    const param = searchParams.get('reason');
    if (param && CONTACT_REASONS.includes(param as any)) {
      setReason(param);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus(null);

    // Honeypot check (Section 15.5)
    if (website.trim().length > 0) {
      setSubmitStatus({
        type: 'success',
        text: "Thank you! We'll read this carefully and get back to you soon.",
      });
      return;
    }

    const cleanName = fullName.trim();
    const cleanEmail = (user?.email || email).trim();
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
        userId: user ? user.uid : null,
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
      if (!user) {
        setFullName('');
        setEmail('');
        setPhone('');
      }
    } catch {
      setSubmitStatus({
        type: 'error',
        text: 'Something went wrong. Please try again or email us directly.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* C1 — Page Hero */}
      <section className="bg-navy-luxury text-white py-16 md:py-24 px-4 sm:px-6 text-center border-b-2 border-[#C9A227]">
        <div className="max-w-[900px] mx-auto">
          <SectionLabel centered>CONNECT WITH KALYANSETU</SectionLabel>
          <h1 className="font-serif-heading text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Let&apos;s Build Something Meaningful Together
          </h1>
          <p className="font-garamond italic text-2xl text-[#E8C96A]">
            Whether you want to partner, support, invest, or simply say hello.
          </p>
        </div>
      </section>

      {/* C2 & C3 — Contact Form + Founder Contact Card */}
      <section className="bg-cream-luxury py-16 md:py-24 px-4 sm:px-6">
        <div className="max-w-[1150px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-[#EDE4CC] border-2 border-[#C9A227] rounded-2xl p-6 sm:p-10 shadow-luxury">
            <SectionLabel>SEND A MESSAGE</SectionLabel>
            <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#1A2A4A] mb-3">
              Write to KalyanSetu
            </h2>

            {/* Optional sign-in prompt for signed-out visitors only */}
            {!user && (
              <div className="mb-6 p-4 rounded-xl bg-[#F5EFE0] border border-[#C9A227]/60 flex flex-wrap items-center justify-between gap-3 text-sm text-[#7A6A50] shadow-2xs">
                <span>
                  Have a Google account? Sign in to prefill this form and track your messages.
                </span>
                <button
                  type="button"
                  onClick={openLoginModal}
                  className="font-bold text-[#1A2A4A] underline underline-offset-4 hover:text-[#C9A227] whitespace-nowrap cursor-pointer"
                >
                  Sign in with Google
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
                    placeholder="Your full name"
                    className="w-full bg-[#F5EFE0] border border-[#C9A227]/60 rounded-[4px] px-4 py-2.5 text-[#3D3520] focus:bg-white"
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
                    readOnly={Boolean(user)}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`w-full border border-[#C9A227]/60 rounded-[4px] px-4 py-2.5 text-[#3D3520] ${
                      user
                        ? 'bg-[#EDE4CC]/70 text-[#7A6A50] cursor-not-allowed'
                        : 'bg-[#F5EFE0] focus:bg-white'
                    }`}
                  />
                  {user && (
                    <span className="block text-xs text-[#7A6A50] mt-1">
                      Linked to your signed-in Google account
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
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#F5EFE0] border border-[#C9A227]/60 rounded-[4px] px-4 py-2.5 text-[#3D3520] focus:bg-white"
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
                    className="w-full bg-[#F5EFE0] border border-[#C9A227]/60 rounded-[4px] px-4 py-2.5 text-[#3D3520] focus:bg-white"
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
                  placeholder="Tell us what's on your mind..."
                  className="w-full bg-[#F5EFE0] border border-[#C9A227]/60 rounded-[4px] px-4 py-3 text-[#3D3520] focus:bg-white"
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
                  className="mt-1 w-4 h-4 accent-[#1A2A4A] rounded shrink-0"
                />
                <label htmlFor="contact-consent" className="text-sm text-[#3D3520] leading-snug">
                  I agree that KalyanSetu may use these details to reply to me. We use your details
                  only to reply to your message. See our{' '}
                  <Link
                    to="/privacy"
                    className="text-[#1A2A4A] font-bold underline underline-offset-2 hover:text-[#C9A227]"
                  >
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              {submitStatus && (
                <div
                  role="status"
                  aria-live="polite"
                  className={`p-4 rounded-lg border flex items-start gap-3 ${
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

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-9 py-3.5 bg-[#C9A227] text-white font-bold rounded-[4px] hover:bg-[#b38f20] hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
              >
                {submitting ? 'Sending…' : 'Send Message →'}
              </button>
            </form>
          </div>

          {/* Right: C3 Founder Contact Card (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#F5EFE0] border-2 border-[#C9A227] rounded-xl p-8 text-center shadow-xs">
              <FounderAvatarBlock
                size="sm"
                showUniversity={true}
                quote='"Every conversation gets my personal attention."'
              />
              <div className="mt-6 pt-6 border-t border-[#C9A227]/30 text-sm text-[#7A6A50] space-y-2">
                <p>
                  Direct Email:{' '}
                  <a
                    href="mailto:hello@kalyansetu.in"
                    className="font-bold text-[#1A2A4A] underline underline-offset-4 hover:text-[#C9A227]"
                  >
                    hello@kalyansetu.in
                  </a>
                </p>
                <p>NIC Code: 56100 · Restaurants &amp; Mobile Food Service Activities</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* C4 — What Happens Next */}
      <section className="bg-[#EDE4CC] py-16 md:py-20 px-4 sm:px-6">
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
                title: 'Step 1: You send a message',
                description:
                  'Your message is saved securely in Firebase Firestore and the founder receives an instant notification.',
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
                  'We respond directly to your email address to continue the conversation.',
              },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
