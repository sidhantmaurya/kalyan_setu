import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Trash2, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SectionLabel } from '../components/ReusableBlocks';
import {
  FirestoreContactMessage,
  subscribeUserMessages,
  updateUserPhoneInFirestore,
  deleteUserAccountFromFirestore,
} from '../lib/firestoreService';

function formatMessageStatusLabel(status: string): string {
  if (status === 'read') return 'Read';
  if (status === 'replied') return 'Replied';
  return 'Received';
}

export function DashboardPage() {
  const { user, profile, loading, signOutUser, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<FirestoreContactMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  const [phoneInput, setPhoneInput] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneStatus, setPhoneStatus] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (profile) {
      setPhoneInput(profile.phone || '');
    }
  }, [profile]);

  useEffect(() => {
    if (loading || !user) return;
    setLoadingMessages(true);
    setMessagesError(null);

    const unsubscribe = subscribeUserMessages(
      user.uid,
      (list) => {
        setMessages(list);
        setLoadingMessages(false);
      },
      () => {
        setMessagesError('Could not load your messages.');
        setLoadingMessages(false);
      }
    );

    return () => unsubscribe();
  }, [loading, user]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F5EFE0]">
        <p className="font-serif-heading text-xl text-[#1A2A4A]">Loading your dashboard…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login?next=/dashboard" replace />;
  }

  const displayName = profile?.fullName || user.displayName || 'Member';
  const firstName = displayName.split(' ')[0];
  const email = profile?.email || user.email || '';
  const avatarUrl = profile?.avatarUrl || user.photoURL || '';
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Recently joined';

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneStatus(null);
    if (phoneInput.trim().length > 20) {
      setPhoneStatus({ type: 'error', text: 'Phone number must be 20 characters or fewer.' });
      return;
    }
    setSavingPhone(true);
    try {
      await updateUserPhoneInFirestore(user.uid, phoneInput);
      await refreshProfile();
      setPhoneStatus({ type: 'success', text: 'Your phone number has been saved.' });
    } catch {
      setPhoneStatus({ type: 'error', text: 'Failed to update phone number.' });
    } finally {
      setSavingPhone(false);
    }
  };

  const handleConfirmDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteUserAccountFromFirestore(user.uid);
      await signOutUser();
      navigate('/');
    } catch (err) {
      console.error('Account deletion failed:', err);
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  return (
    <div>
      {/* Page Hero */}
      <section className="bg-[#1A2A4A] text-white py-14 md:py-20 px-4 sm:px-6 border-b-2 border-[#C9A227]">
        <div className="max-w-[1100px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[2.5px] text-[#C9A227] font-bold mb-2">
              MEMBER DASHBOARD
            </p>
            <h1 className="font-serif-heading text-3xl sm:text-5xl font-bold text-white">
              Hello, {firstName}
            </h1>
          </div>
          {profile?.role === 'admin' && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C9A227] text-white font-bold text-sm rounded-[4px] hover:bg-[#b38f20] transition-colors self-start sm:self-auto"
            >
              <Shield className="w-4 h-4" />
              <span>Open Admin Panel</span>
            </Link>
          )}
        </div>
      </section>

      <section className="bg-[#F5EFE0] py-14 md:py-20 px-4 sm:px-6">
        <div className="max-w-[1100px] mx-auto space-y-12">
          {/* Profile Card */}
          <div className="bg-[#EDE4CC] border-2 border-[#C9A227] rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-full object-cover border-2 border-[#1A2A4A]"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#1A2A4A] text-white font-serif-heading text-2xl font-bold flex items-center justify-center border-2 border-[#C9A227]">
                  {firstName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="font-serif-heading text-2xl font-bold text-[#1A2A4A]">
                  {displayName}
                </h2>
                <p className="text-[#3D3520] text-sm mt-0.5">{email}</p>
                <p className="text-xs text-[#7A6A50] mt-1.5">Member since {memberSince}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                await signOutUser();
                navigate('/');
              }}
              className="px-6 py-2.5 border-2 border-[#1A2A4A] text-[#1A2A4A] font-bold text-sm rounded-[4px] hover:bg-[#1A2A4A] hover:text-white transition-colors whitespace-nowrap cursor-pointer"
            >
              Sign out
            </button>
          </div>

          {/* Section — Your Messages */}
          <div className="bg-[#EDE4CC] border border-[#C9A227] rounded-xl p-6 sm:p-8">
            <SectionLabel>CONVERSATION HISTORY</SectionLabel>
            <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#1A2A4A] mb-6">
              Your Messages
            </h2>

            {loadingMessages ? (
              <div className="space-y-3 py-4">
                <div className="h-14 bg-[#F5EFE0] rounded animate-pulse" />
                <div className="h-14 bg-[#F5EFE0] rounded animate-pulse" />
              </div>
            ) : messagesError ? (
              <div className="p-4 rounded-lg bg-red-50 border border-red-300 text-red-900 text-sm">
                {messagesError}
              </div>
            ) : messages.length === 0 ? (
              <div className="bg-[#F5EFE0] border border-[#C9A227]/40 rounded-lg p-8 text-center">
                <p className="text-[#7A6A50] text-lg mb-5">
                  You haven&apos;t sent us a message yet.
                </p>
                <Link
                  to="/contact"
                  className="inline-block px-8 py-3 bg-[#C9A227] text-white font-bold rounded-[4px] hover:bg-[#b38f20] transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[#C9A227] text-xs uppercase tracking-wider text-[#1A2A4A]">
                      <th scope="col" className="py-3 px-4">
                        Date
                      </th>
                      <th scope="col" className="py-3 px-4">
                        Reason
                      </th>
                      <th scope="col" className="py-3 px-4">
                        Message
                      </th>
                      <th scope="col" className="py-3 px-4">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C9A227]/30 text-sm">
                    {messages.map((msg) => {
                      const snippet =
                        msg.message.length > 80 ? msg.message.slice(0, 80) + '…' : msg.message;
                      const formattedDate = new Date(msg.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      });
                      const statusLabel = formatMessageStatusLabel(msg.status);

                      return (
                        <tr key={msg.id} className="bg-[#F5EFE0]/70 hover:bg-[#F5EFE0]">
                          <td className="py-3.5 px-4 whitespace-nowrap text-[#7A6A50] tabular-nums">
                            {formattedDate}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#1A2A4A] whitespace-nowrap">
                            {msg.reason}
                          </td>
                          <td className="py-3.5 px-4 text-[#3D3520]">{snippet}</td>
                          <td className="py-3.5 px-4 whitespace-nowrap font-bold text-[#1A2A4A]">
                            {statusLabel}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section — Your Details */}
          <div className="bg-[#EDE4CC] border border-[#C9A227] rounded-xl p-6 sm:p-8">
            <SectionLabel>ACCOUNT SETTINGS</SectionLabel>
            <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#1A2A4A] mb-6">
              Your Details
            </h2>

            <form onSubmit={handleSavePhone} className="max-w-xl space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dash-name" className="block text-sm font-bold text-[#1A2A4A] mb-1">
                    Full Name (from Google)
                  </label>
                  <input
                    id="dash-name"
                    type="text"
                    readOnly
                    value={displayName}
                    className="w-full bg-[#EDE4CC] border border-[#C9A227]/50 rounded-[4px] px-3.5 py-2 text-sm text-[#7A6A50] cursor-not-allowed"
                  />
                </div>
                <div>
                  <label
                    htmlFor="dash-email"
                    className="block text-sm font-bold text-[#1A2A4A] mb-1"
                  >
                    Email Address (from Google)
                  </label>
                  <input
                    id="dash-email"
                    type="email"
                    readOnly
                    value={email}
                    className="w-full bg-[#EDE4CC] border border-[#C9A227]/50 rounded-[4px] px-3.5 py-2 text-sm text-[#7A6A50] cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="dash-phone" className="block text-sm font-bold text-[#1A2A4A] mb-1">
                  Phone Number <span className="text-xs font-normal text-[#7A6A50]">(optional)</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    id="dash-phone"
                    type="tel"
                    maxLength={20}
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="flex-1 bg-[#F5EFE0] border border-[#C9A227] rounded-[4px] px-4 py-2 text-sm text-[#3D3520] focus:bg-white"
                  />
                  <button
                    type="submit"
                    disabled={savingPhone}
                    className="px-6 py-2 bg-[#C9A227] text-white font-bold text-sm rounded-[4px] hover:bg-[#b38f20] transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60"
                  >
                    {savingPhone ? 'Saving…' : 'Save Phone'}
                  </button>
                </div>
              </div>

              {phoneStatus && (
                <p
                  role="status"
                  aria-live="polite"
                  className={`text-sm flex items-center gap-2 ${
                    phoneStatus.type === 'success' ? 'text-[#1A2A4A]' : 'text-red-800'
                  }`}
                >
                  {phoneStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#C9A227]" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-700" />
                  )}
                  <span>{phoneStatus.text}</span>
                </p>
              )}
            </form>

            <div className="mt-10 pt-6 border-t border-[#C9A227]/40">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-sm text-[#7A6A50] hover:text-red-800 underline underline-offset-4 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete my account</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Account Deletion Confirmation Modal */}
      {deleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A2A4A]/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div className="bg-[#F5EFE0] border-2 border-[#C9A227] rounded-xl max-w-md w-full p-7 shadow-2xl">
            <h3
              id="delete-modal-title"
              className="font-serif-heading text-2xl font-bold text-[#1A2A4A] mb-3"
            >
              Delete your account?
            </h3>
            <p className="text-sm text-[#3D3520] leading-relaxed mb-6">
              This will permanently remove your KalyanSetu user profile from Firebase Firestore and
              sign you out. Any contact messages you previously submitted will remain archived.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-5 py-2 border border-[#1A2A4A] text-[#1A2A4A] text-sm font-bold rounded-[4px] hover:bg-[#EDE4CC] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDeleteAccount}
                className="px-5 py-2 bg-red-800 text-white text-sm font-bold rounded-[4px] hover:bg-red-900 cursor-pointer disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Yes, delete account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
