import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, NavLink, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard,
  Mail,
  Users,
  Newspaper,
  Activity,
  Search,
  Download,
  X,
  RefreshCw,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CONTACT_REASONS } from '../data/kalyansetuData';
import { SectionLabel } from '../components/ReusableBlocks';
import {
  FirestoreContactMessage,
  FirestoreProfile,
  FirestoreSubscriber,
  FirestoreActivityLog,
  subscribeAdminData,
  updateMessageInFirestoreByAdmin,
  updateUserRoleInFirestoreByAdmin,
} from '../lib/firestoreService';

function formatIstDateTime(iso: string | null): string {
  if (!iso) return '—';
  return (
    new Date(iso).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' IST'
  );
}

function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const escapeCsvCell = (cell: string) => `"${String(cell ?? '').replace(/"/g, '""')}"`;
  const csvContent = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((r) => r.map(escapeCsvCell).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function AdminPanel() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Add noindex, nofollow meta tag on all /admin* pages (Section 12.2 & 18.6)
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const activeTab = useMemo(() => {
    if (location.pathname.startsWith('/admin/messages')) return 'messages';
    if (location.pathname.startsWith('/admin/users')) return 'users';
    if (location.pathname.startsWith('/admin/subscribers')) return 'subscribers';
    if (location.pathname.startsWith('/admin/logs')) return 'logs';
    return 'overview';
  }, [location.pathname]);

  // Shared Admin Data States (Real-time from Firestore)
  const [messages, setMessages] = useState<FirestoreContactMessage[]>([]);
  const [rawUsers, setRawUsers] = useState<FirestoreProfile[]>([]);
  const [subscribers, setSubscribers] = useState<FirestoreSubscriber[]>([]);
  const [activityLogs, setActivityLogs] = useState<FirestoreActivityLog[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Messages View Controls
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [reasonFilter, setReasonFilter] = useState<string>('All');
  const [msgSearch, setMsgSearch] = useState<string>('');
  const [msgSort, setMsgSort] = useState<'newest' | 'oldest'>('newest');
  const [msgPage, setMsgPage] = useState<number>(1);
  const [selectedMessage, setSelectedMessage] = useState<FirestoreContactMessage | null>(null);
  const [notesDraft, setNotesDraft] = useState<string>('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [retryingEmail, setRetryingEmail] = useState(false);
  const [emailPreviewHtml, setEmailPreviewHtml] = useState<string | null>(null);

  // Users View Controls
  const [userSearch, setUserSearch] = useState<string>('');
  const [userSort, setUserSort] = useState<'joined' | 'lastLogin'>('joined');
  const [userPage, setUserPage] = useState<number>(1);
  const [roleModalTarget, setRoleModalTarget] = useState<{
    user: FirestoreProfile;
    nextRole: 'user' | 'admin';
  } | null>(null);
  const [updatingRole, setUpdatingRole] = useState(false);

  // Subscribers View Controls
  const [subSearch, setSubSearch] = useState<string>('');
  const [subSort, setSubSort] = useState<'newest' | 'oldest'>('newest');

  // Activity Logs View Controls
  const [logEventFilter, setLogEventFilter] = useState<string>('All');
  const [logSearch, setLogSearch] = useState<string>('');
  const [logSort, setLogSort] = useState<'newest' | 'oldest'>('newest');

  // Attach real-time Firestore listeners only when authenticated as admin
  useEffect(() => {
    if (loading || !user || profile?.role !== 'admin') return;
    setDataLoading(true);
    setDataError(null);

    const unsubscribe = subscribeAdminData(
      (msgs) => {
        setMessages(msgs);
        setDataLoading(false);
      },
      (usrs) => {
        setRawUsers(usrs);
        setDataLoading(false);
      },
      (subs) => {
        setSubscribers(subs);
        setDataLoading(false);
      },
      (logs) => {
        setActivityLogs(logs);
        setDataLoading(false);
      },
      () => {
        setDataError('Failed to stream records from Firebase Firestore.');
        setDataLoading(false);
      }
    );

    return () => unsubscribe();
  }, [loading, user, profile?.role]);

  // Keep selectedMessage synchronized with live Firestore updates
  useEffect(() => {
    if (!selectedMessage) return;
    const updated = messages.find((m) => m.id === selectedMessage.id);
    if (updated) {
      setSelectedMessage(updated);
    }
  }, [messages, selectedMessage]);

  // Close drawer on Escape key (Section 21)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (emailPreviewHtml) {
          setEmailPreviewHtml(null);
        } else if (selectedMessage) {
          setSelectedMessage(null);
        } else if (roleModalTarget) {
          setRoleModalTarget(null);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedMessage, emailPreviewHtml, roleModalTarget]);

  const handleOpenMessageDrawer = useCallback(async (msg: FirestoreContactMessage) => {
    setSelectedMessage(msg);
    setNotesDraft(msg.adminNotes || '');
    if (msg.status === 'new') {
      try {
        await updateMessageInFirestoreByAdmin(msg.id, { status: 'read' });
      } catch {
        // Ignore error on auto-mark read
      }
    }
  }, []);

  // Support ?id=<message id> deep link from Admin Email notification button
  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam && messages.length > 0 && !selectedMessage) {
      const found = messages.find((m) => m.id === idParam);
      if (found) {
        handleOpenMessageDrawer(found);
        searchParams.delete('id');
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [searchParams, messages, selectedMessage, handleOpenMessageDrawer, setSearchParams]);

  // Compute messagesSent count per user
  const usersWithCounts = useMemo(() => {
    return rawUsers.map((u) => {
      const count = messages.filter(
        (m) => m.userId === u.id || m.email.toLowerCase() === u.email.toLowerCase()
      ).length;
      return { ...u, messagesSent: count };
    });
  }, [rawUsers, messages]);

  // Route Guards (Section 11.4)
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F5EFE0]">
        <p className="font-serif-heading text-xl text-[#1A2A4A]">Verifying access…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (profile?.role !== 'admin') {
    return (
      <section className="min-h-[65vh] bg-[#F5EFE0] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-[#EDE4CC] border-2 border-[#C9A227] rounded-xl p-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[2.5px] text-[#C9A227] mb-2">
            HTTP 403
          </p>
          <h1 className="font-serif-heading text-3xl font-bold text-[#1A2A4A] mb-3">
            403 — Admin access only
          </h1>
          <p className="text-[#7A6A50] text-sm mb-6">
            Your signed-in Google account does not have administrator permissions.
          </p>
          <Link
            to="/"
            className="inline-block px-7 py-3 bg-[#C9A227] text-white font-bold text-sm rounded-[4px] hover:bg-[#b38f20] transition-colors"
          >
            Return Home
          </Link>
        </div>
      </section>
    );
  }

  // Computed Stats for Overview
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newMessagesCount = messages.filter((m) => m.status === 'new').length;
  const messagesThisWeekCount = messages.filter(
    (m) => new Date(m.createdAt).getTime() >= oneWeekAgo
  ).length;

  // Filtered & Paginated Messages
  const filteredMessages = messages
    .filter((m) => {
      if (statusFilter !== 'All' && m.status !== statusFilter.toLowerCase()) return false;
      if (reasonFilter !== 'All' && m.reason !== reasonFilter) return false;
      if (msgSearch.trim()) {
        const q = msgSearch.toLowerCase();
        return (
          m.fullName.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.message.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return msgSort === 'newest' ? diff : -diff;
    });

  const MSG_PAGE_SIZE = 20;
  const totalMsgPages = Math.max(1, Math.ceil(filteredMessages.length / MSG_PAGE_SIZE));
  const paginatedMessages = filteredMessages.slice(
    (msgPage - 1) * MSG_PAGE_SIZE,
    msgPage * MSG_PAGE_SIZE
  );

  // Filtered & Paginated Users
  const filteredUsers = usersWithCounts
    .filter((u) => {
      if (!userSearch.trim()) return true;
      const q = userSearch.toLowerCase();
      return (u.fullName || '').toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (userSort === 'lastLogin') {
        const tA = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
        const tB = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
        return tB - tA;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const USER_PAGE_SIZE = 20;
  const totalUserPages = Math.max(1, Math.ceil(filteredUsers.length / USER_PAGE_SIZE));
  const paginatedUsers = filteredUsers.slice(
    (userPage - 1) * USER_PAGE_SIZE,
    userPage * USER_PAGE_SIZE
  );

  // Filtered Subscribers
  const filteredSubscribers = subscribers
    .filter((s) => !subSearch.trim() || s.email.toLowerCase().includes(subSearch.toLowerCase()))
    .sort((a, b) => {
      const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return subSort === 'newest' ? diff : -diff;
    });

  // Filtered Activity Logs
  const filteredActivityLogs = activityLogs
    .filter((l) => {
      if (logEventFilter !== 'All' && l.eventType !== logEventFilter) return false;
      if (logSearch.trim()) {
        const q = logSearch.toLowerCase();
        return (
          l.fullName.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q) ||
          l.eventType.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return logSort === 'newest' ? diff : -diff;
    });

  const handleStatusChange = async (
    msgId: string,
    newStatus: 'new' | 'read' | 'replied' | 'archived'
  ) => {
    try {
      await updateMessageInFirestoreByAdmin(msgId, { status: newStatus });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleSaveAdminNotes = async () => {
    if (!selectedMessage) return;
    setSavingNotes(true);
    try {
      await updateMessageInFirestoreByAdmin(selectedMessage.id, { adminNotes: notesDraft });
    } finally {
      setSavingNotes(false);
    }
  };

  const handleRetryNotification = async (msg: FirestoreContactMessage) => {
    setRetryingEmail(true);
    try {
      const res = await fetch('/api/contact/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: msg.id,
          fullName: msg.fullName,
          email: msg.email,
          phone: msg.phone,
          reason: msg.reason,
          message: msg.message,
          isSignedIn: Boolean(msg.userId),
          profileEmail: msg.email,
          createdAt: msg.createdAt,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await updateMessageInFirestoreByAdmin(msg.id, {
          notifiedAt: new Date().toISOString(),
          notificationError: '',
        });
      } else {
        await updateMessageInFirestoreByAdmin(msg.id, {
          notificationError: data.error || 'Email retry failed',
        });
      }
    } finally {
      setRetryingEmail(false);
    }
  };

  const handleViewEmailPreview = async (msg: FirestoreContactMessage) => {
    try {
      const res = await fetch('/api/contact/email-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: msg.id,
          fullName: msg.fullName,
          email: msg.email,
          phone: msg.phone,
          reason: msg.reason,
          message: msg.message,
          isSignedIn: Boolean(msg.userId),
          profileEmail: msg.email,
          createdAt: msg.createdAt,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setEmailPreviewHtml(data.html);
      }
    } catch (err) {
      console.error('Failed to load email preview:', err);
    }
  };

  const handleConfirmRoleChange = async () => {
    if (!roleModalTarget) return;
    setUpdatingRole(true);
    try {
      await updateUserRoleInFirestoreByAdmin(roleModalTarget.user, roleModalTarget.nextRole);
    } finally {
      setUpdatingRole(false);
      setRoleModalTarget(null);
    }
  };

  const navLinks = [
    { to: '/admin', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" />, end: true },
    { to: '/admin/messages', label: 'Messages', icon: <Mail className="w-4 h-4" />, end: false },
    { to: '/admin/users', label: 'Users', icon: <Users className="w-4 h-4" />, end: false },
    {
      to: '/admin/subscribers',
      label: 'Subscribers',
      icon: <Newspaper className="w-4 h-4" />,
      end: false,
    },
    {
      to: '/admin/logs',
      label: 'Activity Logs',
      icon: <Activity className="w-4 h-4" />,
      end: false,
    },
  ];

  return (
    <div className="min-h-[calc(100vh-76px)] bg-[#F5EFE0] flex flex-col lg:flex-row">
      {/* Navy Sidebar (Desktop) / Top Tab Bar (Mobile) */}
      <aside className="bg-[#1A2A4A] text-white lg:w-64 shrink-0 border-b-2 lg:border-b-0 lg:border-r-2 border-[#C9A227]">
        <div className="p-5 lg:p-6">
          <p className="text-[11px] font-bold uppercase tracking-[2.5px] text-[#C9A227] mb-1">
            ADMINISTRATION
          </p>
          <h1 className="font-serif-heading text-xl font-bold text-white">KalyanSetu Portal</h1>
        </div>

        <nav
          aria-label="Admin panel navigation"
          className="flex lg:flex-col overflow-x-auto px-3 pb-3 lg:px-4 lg:space-y-1.5 gap-2 lg:gap-0"
        >
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#C9A227] text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Cream Content Area */}
      <div className="flex-1 p-4 sm:p-8 lg:p-10 max-w-full overflow-x-hidden">
        {dataError && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-300 text-red-900 text-sm">
            {dataError}
          </div>
        )}

        {/* 13.1 OVERVIEW — /admin */}
        {activeTab === 'overview' && (
          <div className="space-y-10">
            <div>
              <SectionLabel>OVERVIEW</SectionLabel>
              <h2 className="font-serif-heading text-3xl font-bold text-[#1A2A4A]">
                Mission Control
              </h2>
            </div>

            {/* 4 Stat Cards — Numbered Card Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {[
                {
                  num: '01',
                  label: 'New messages',
                  value: newMessagesCount,
                  sub: 'Status = new',
                },
                {
                  num: '02',
                  label: 'Total messages',
                  value: messages.length,
                  sub: 'All contact inquiries',
                },
                {
                  num: '03',
                  label: 'Total users',
                  value: usersWithCounts.length,
                  sub: 'Registered Google profiles',
                },
                {
                  num: '04',
                  label: 'Messages this week',
                  value: messagesThisWeekCount,
                  sub: 'Past 7 days',
                },
              ].map((stat) => (
                <div
                  key={stat.num}
                  className="bg-[#EDE4CC] border border-[#C9A227] rounded-xl p-6 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 border-2 border-[#C9A227] flex items-center justify-center">
                      <span className="font-serif-heading text-sm font-bold text-[#C9A227] tabular-nums">
                        {stat.num}
                      </span>
                    </div>
                    <span className="text-xs text-[#7A6A50]">{stat.sub}</span>
                  </div>
                  <div>
                    <p className="font-serif-heading text-4xl font-bold text-[#1A2A4A] tabular-nums">
                      {dataLoading ? '…' : stat.value}
                    </p>
                    <p className="text-sm font-bold text-[#3D3520] mt-1">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Latest 5 Messages Table */}
            <div className="bg-[#EDE4CC] border border-[#C9A227] rounded-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-serif-heading text-2xl font-bold text-[#1A2A4A]">
                  Latest 5 messages
                </h3>
                <Link
                  to="/admin/messages"
                  className="text-sm font-bold text-[#1A2A4A] hover:text-[#C9A227] underline underline-offset-4"
                >
                  View all →
                </Link>
              </div>

              {dataLoading ? (
                <div className="space-y-3">
                  <div className="h-12 bg-[#F5EFE0] rounded animate-pulse" />
                  <div className="h-12 bg-[#F5EFE0] rounded animate-pulse" />
                </div>
              ) : messages.length === 0 ? (
                <p className="text-sm text-[#7A6A50] py-6 text-center">No messages received yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-[#C9A227] text-xs uppercase tracking-wider text-[#1A2A4A]">
                        <th scope="col" className="py-3 px-3">
                          Received
                        </th>
                        <th scope="col" className="py-3 px-3">
                          Name
                        </th>
                        <th scope="col" className="py-3 px-3">
                          Reason
                        </th>
                        <th scope="col" className="py-3 px-3">
                          Status
                        </th>
                        <th scope="col" className="py-3 px-3">
                          Email sent?
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C9A227]/30 text-sm">
                      {messages.slice(0, 5).map((m) => (
                        <tr
                          key={m.id}
                          onClick={() => handleOpenMessageDrawer(m)}
                          className={`cursor-pointer transition-colors hover:bg-[#F5EFE0] ${
                            m.status === 'new' ? 'font-bold bg-[#F5EFE0]/80' : 'bg-[#F5EFE0]/40'
                          }`}
                        >
                          <td className="py-3 px-3 whitespace-nowrap text-[#7A6A50] tabular-nums">
                            {formatIstDateTime(m.createdAt)}
                          </td>
                          <td className="py-3 px-3 text-[#1A2A4A] whitespace-nowrap">
                            {m.status === 'new' && (
                              <span
                                className="inline-block w-2 h-2 rounded-full bg-[#C9A227] mr-2"
                                aria-hidden="true"
                              />
                            )}
                            {m.fullName}
                          </td>
                          <td className="py-3 px-3 text-[#3D3520] whitespace-nowrap">{m.reason}</td>
                          <td className="py-3 px-3 uppercase text-xs tracking-wider text-[#1A2A4A]">
                            {m.status}
                          </td>
                          <td className="py-3 px-3 tabular-nums">
                            {m.notifiedAt ? '✓ Sent' : '✗ Pending'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Latest Activity Logs Snapshot */}
            <div className="bg-[#EDE4CC] border border-[#C9A227] rounded-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-serif-heading text-2xl font-bold text-[#1A2A4A]">
                    Recent Activity Logs (Signup, Signin, Logout, Subscriber &amp; Contact)
                  </h3>
                  <p className="text-xs text-[#7A6A50] mt-0.5">
                    Firestore collection: <code>/activity_logs</code>
                  </p>
                </div>
                <Link
                  to="/admin/logs"
                  className="text-sm font-bold text-[#1A2A4A] hover:text-[#C9A227] underline underline-offset-4 whitespace-nowrap"
                >
                  View all logs →
                </Link>
              </div>

              {activityLogs.length === 0 ? (
                <p className="text-sm text-[#7A6A50] py-4 text-center">No activity logs recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-[#C9A227] text-xs uppercase tracking-wider text-[#1A2A4A]">
                        <th scope="col" className="py-3 px-3">Timestamp (IST)</th>
                        <th scope="col" className="py-3 px-3">Event Type</th>
                        <th scope="col" className="py-3 px-3">Name</th>
                        <th scope="col" className="py-3 px-3">Email</th>
                        <th scope="col" className="py-3 px-3">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C9A227]/30 text-sm">
                      {activityLogs.slice(0, 6).map((log) => (
                        <tr key={log.id} className="bg-[#F5EFE0]/60 hover:bg-[#F5EFE0]">
                          <td className="py-3 px-3 whitespace-nowrap text-xs text-[#7A6A50] tabular-nums">
                            {formatIstDateTime(log.createdAt)}
                          </td>
                          <td className="py-3 px-3 uppercase text-xs font-bold tracking-wider text-[#1A2A4A] whitespace-nowrap">
                            {log.eventType}
                          </td>
                          <td className="py-3 px-3 font-bold text-[#1A2A4A] whitespace-nowrap">
                            {log.fullName}
                          </td>
                          <td className="py-3 px-3 text-[#3D3520] whitespace-nowrap">
                            {log.email}
                          </td>
                          <td className="py-3 px-3 text-[#7A6A50]">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 13.2 MESSAGES — /admin/messages */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <SectionLabel>INBOX &amp; DISPATCH</SectionLabel>
                <h2 className="font-serif-heading text-3xl font-bold text-[#1A2A4A]">
                  Contact Messages
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  downloadCsv(
                    'kalyansetu-messages.csv',
                    [
                      'ID',
                      'Received (IST)',
                      'Full Name',
                      'Email',
                      'Phone',
                      'Reason',
                      'Message',
                      'Status',
                      'Email Sent',
                      'Admin Notes',
                    ],
                    filteredMessages.map((m) => [
                      m.id,
                      formatIstDateTime(m.createdAt),
                      m.fullName,
                      m.email,
                      m.phone || '',
                      m.reason,
                      m.message,
                      m.status,
                      m.notifiedAt ? 'Yes' : 'No',
                      m.adminNotes || '',
                    ])
                  )
                }
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A2A4A] text-white text-xs font-bold rounded-[4px] hover:bg-[#1A2A4A]/90 transition-colors self-start sm:self-auto cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export current view to CSV</span>
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-[#EDE4CC] border border-[#C9A227] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#7A6A50] absolute left-3 top-3" />
                <input
                  type="search"
                  value={msgSearch}
                  onChange={(e) => {
                    setMsgSearch(e.target.value);
                    setMsgPage(1);
                  }}
                  placeholder="Search name, email, message…"
                  aria-label="Search messages"
                  className="w-full bg-[#F5EFE0] border border-[#C9A227]/60 rounded-[4px] pl-9 pr-3 py-2 text-sm text-[#3D3520]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setMsgPage(1);
                }}
                aria-label="Filter by status"
                className="bg-[#F5EFE0] border border-[#C9A227]/60 rounded-[4px] px-3 py-2 text-sm text-[#3D3520]"
              >
                <option value="All">Status: All</option>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
              </select>

              <select
                value={reasonFilter}
                onChange={(e) => {
                  setReasonFilter(e.target.value);
                  setMsgPage(1);
                }}
                aria-label="Filter by reason"
                className="bg-[#F5EFE0] border border-[#C9A227]/60 rounded-[4px] px-3 py-2 text-sm text-[#3D3520]"
              >
                <option value="All">Reason: All</option>
                {CONTACT_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <select
                value={msgSort}
                onChange={(e) => setMsgSort(e.target.value as 'newest' | 'oldest')}
                aria-label="Sort messages by date"
                className="bg-[#F5EFE0] border border-[#C9A227]/60 rounded-[4px] px-3 py-2 text-sm text-[#3D3520]"
              >
                <option value="newest">Sort: Newest first</option>
                <option value="oldest">Sort: Oldest first</option>
              </select>
            </div>

            {/* Messages Table */}
            <div className="bg-[#EDE4CC] border border-[#C9A227] rounded-xl p-4 sm:p-6">
              {dataLoading ? (
                <div className="space-y-3">
                  <div className="h-12 bg-[#F5EFE0] rounded animate-pulse" />
                  <div className="h-12 bg-[#F5EFE0] rounded animate-pulse" />
                </div>
              ) : paginatedMessages.length === 0 ? (
                <p className="text-center py-8 text-sm text-[#7A6A50]">
                  No messages match the current filters.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-[#C9A227] text-xs uppercase tracking-wider text-[#1A2A4A]">
                        <th scope="col" className="py-3 px-3">
                          Received (IST)
                        </th>
                        <th scope="col" className="py-3 px-3">
                          Name
                        </th>
                        <th scope="col" className="py-3 px-3">
                          Email
                        </th>
                        <th scope="col" className="py-3 px-3">
                          Phone
                        </th>
                        <th scope="col" className="py-3 px-3">
                          Reason
                        </th>
                        <th scope="col" className="py-3 px-3">
                          Message
                        </th>
                        <th scope="col" className="py-3 px-3">
                          Status
                        </th>
                        <th scope="col" className="py-3 px-3">
                          Email sent?
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C9A227]/30 text-sm">
                      {paginatedMessages.map((m) => (
                        <tr
                          key={m.id}
                          onClick={() => handleOpenMessageDrawer(m)}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleOpenMessageDrawer(m);
                            }
                          }}
                          className={`cursor-pointer transition-colors hover:bg-[#F5EFE0] ${
                            m.status === 'new' ? 'font-bold bg-[#F5EFE0]/90' : 'bg-[#F5EFE0]/45'
                          }`}
                        >
                          <td className="py-3 px-3 whitespace-nowrap text-xs text-[#7A6A50] tabular-nums">
                            {formatIstDateTime(m.createdAt)}
                          </td>
                          <td className="py-3 px-3 text-[#1A2A4A] whitespace-nowrap">
                            {m.status === 'new' && (
                              <span
                                className="inline-block w-2 h-2 rounded-full bg-[#C9A227] mr-2"
                                aria-hidden="true"
                              />
                            )}
                            {m.fullName}
                          </td>
                          <td className="py-3 px-3 text-[#3D3520] whitespace-nowrap">{m.email}</td>
                          <td className="py-3 px-3 text-[#7A6A50] whitespace-nowrap tabular-nums">
                            {m.phone || '—'}
                          </td>
                          <td className="py-3 px-3 text-[#1A2A4A] whitespace-nowrap">{m.reason}</td>
                          <td className="py-3 px-3 text-[#3D3520] max-w-[220px] truncate">
                            {m.message}
                          </td>
                          <td className="py-3 px-3 uppercase text-xs tracking-wider text-[#1A2A4A] whitespace-nowrap">
                            {m.status}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            {m.notifiedAt ? (
                              <span className="text-[#1A2A4A] font-bold">✓ Yes</span>
                            ) : (
                              <span className="text-red-800 font-bold">✗ No</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination (20 per page) */}
              {totalMsgPages > 1 && (
                <div className="mt-5 pt-4 border-t border-[#C9A227]/30 flex items-center justify-between text-xs text-[#7A6A50]">
                  <span className="tabular-nums">
                    Page {msgPage} of {totalMsgPages} ({filteredMessages.length} total)
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={msgPage <= 1}
                      onClick={() => setMsgPage((p) => p - 1)}
                      className="px-3 py-1.5 border border-[#1A2A4A] text-[#1A2A4A] font-bold rounded disabled:opacity-40 cursor-pointer"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={msgPage >= totalMsgPages}
                      onClick={() => setMsgPage((p) => p + 1)}
                      className="px-3 py-1.5 border border-[#1A2A4A] text-[#1A2A4A] font-bold rounded disabled:opacity-40 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 13.3 USERS — /admin/users */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div>
              <SectionLabel>ACCOUNTS &amp; ROLES</SectionLabel>
              <h2 className="font-serif-heading text-3xl font-bold text-[#1A2A4A]">
                Registered Users
              </h2>
            </div>

            <div className="bg-[#EDE4CC] border border-[#C9A227] rounded-xl p-4 flex flex-col sm:flex-row gap-3 justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#7A6A50] absolute left-3 top-3" />
                <input
                  type="search"
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setUserPage(1);
                  }}
                  placeholder="Search by name or email…"
                  aria-label="Search registered users"
                  className="w-full bg-[#F5EFE0] border border-[#C9A227]/60 rounded-[4px] pl-9 pr-3 py-2 text-sm text-[#3D3520]"
                />
              </div>

              <select
                value={userSort}
                onChange={(e) => setUserSort(e.target.value as 'joined' | 'lastLogin')}
                aria-label="Sort users"
                className="bg-[#F5EFE0] border border-[#C9A227]/60 rounded-[4px] px-3 py-2 text-sm text-[#3D3520]"
              >
                <option value="joined">Sort by: Joined date</option>
                <option value="lastLogin">Sort by: Last login</option>
              </select>
            </div>

            <div className="bg-[#EDE4CC] border border-[#C9A227] rounded-xl p-4 sm:p-6">
              {dataLoading ? (
                <div className="space-y-3">
                  <div className="h-12 bg-[#F5EFE0] rounded animate-pulse" />
                  <div className="h-12 bg-[#F5EFE0] rounded animate-pulse" />
                </div>
              ) : paginatedUsers.length === 0 ? (
                <p className="text-center py-8 text-sm text-[#7A6A50]">No users found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-[#C9A227] text-xs uppercase tracking-wider text-[#1A2A4A]">
                        <th scope="col" className="py-3 px-3">
                          Avatar
                        </th>
                        <th scope="col" className="py-3 px-3">
                          Name
                        </th>
                        <th scope="col" className="py-3 px-3">
                          Email
                        </th>
                        <th scope="col" className="py-3 px-3">
                          Role
                        </th>
                        <th scope="col" className="py-3 px-3">
                          Joined
                        </th>
                        <th scope="col" className="py-3 px-3">
                          Last login
                        </th>
                        <th scope="col" className="py-3 px-3">
                          Messages sent
                        </th>
                        <th scope="col" className="py-3 px-3">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C9A227]/30 text-sm">
                      {paginatedUsers.map((u) => {
                        const isSelf =
                          u.id === user.uid ||
                          u.email.toLowerCase() === (user.email || '').toLowerCase();

                        return (
                          <tr key={u.id} className="bg-[#F5EFE0]/60 hover:bg-[#F5EFE0]">
                            <td className="py-3 px-3">
                              {u.avatarUrl ? (
                                <img
                                  src={u.avatarUrl}
                                  alt={u.fullName || u.email}
                                  referrerPolicy="no-referrer"
                                  className="w-8 h-8 rounded-full object-cover border border-[#1A2A4A]"
                                />
                              ) : (
                                <span className="w-8 h-8 rounded-full bg-[#1A2A4A] text-white text-xs font-bold flex items-center justify-center">
                                  {(u.fullName || u.email).charAt(0).toUpperCase()}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-bold text-[#1A2A4A] whitespace-nowrap">
                              {u.fullName || '—'}
                            </td>
                            <td className="py-3 px-3 text-[#3D3520] whitespace-nowrap">
                              {u.email}
                            </td>
                            <td className="py-3 px-3 uppercase text-xs font-bold tracking-wider text-[#1A2A4A]">
                              {u.role}
                            </td>
                            <td className="py-3 px-3 text-xs text-[#7A6A50] whitespace-nowrap tabular-nums">
                              {formatIstDateTime(u.createdAt)}
                            </td>
                            <td className="py-3 px-3 text-xs text-[#7A6A50] whitespace-nowrap tabular-nums">
                              {formatIstDateTime(u.lastLoginAt)}
                            </td>
                            <td className="py-3 px-3 font-bold text-[#1A2A4A] tabular-nums">
                              {u.messagesSent}
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap">
                              {isSelf ? (
                                <span className="text-xs text-[#7A6A50]">Current Admin</span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setRoleModalTarget({
                                      user: u,
                                      nextRole: u.role === 'admin' ? 'user' : 'admin',
                                    })
                                  }
                                  className="px-3 py-1 border border-[#1A2A4A] text-[#1A2A4A] text-xs font-bold rounded hover:bg-[#1A2A4A] hover:text-white transition-colors cursor-pointer"
                                >
                                  Make {u.role === 'admin' ? 'User' : 'Admin'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {totalUserPages > 1 && (
                <div className="mt-5 pt-4 border-t border-[#C9A227]/30 flex items-center justify-between text-xs text-[#7A6A50]">
                  <span className="tabular-nums">
                    Page {userPage} of {totalUserPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={userPage <= 1}
                      onClick={() => setUserPage((p) => p - 1)}
                      className="px-3 py-1.5 border border-[#1A2A4A] text-[#1A2A4A] font-bold rounded disabled:opacity-40 cursor-pointer"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={userPage >= totalUserPages}
                      onClick={() => setUserPage((p) => p + 1)}
                      className="px-3 py-1.5 border border-[#1A2A4A] text-[#1A2A4A] font-bold rounded disabled:opacity-40 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 13.4 SUBSCRIBERS — /admin/subscribers */}
        {activeTab === 'subscribers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <SectionLabel>NEWSLETTER AUDIENCE</SectionLabel>
                <h2 className="font-serif-heading text-3xl font-bold text-[#1A2A4A]">
                  Newsletter Subscribers
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  downloadCsv(
                    'kalyansetu-subscribers.csv',
                    ['Email', 'Subscribed On (IST)'],
                    filteredSubscribers.map((s) => [s.email, formatIstDateTime(s.createdAt)])
                  )
                }
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A2A4A] text-white text-xs font-bold rounded-[4px] hover:bg-[#1A2A4A]/90 transition-colors self-start sm:self-auto cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export to CSV</span>
              </button>
            </div>

            <div className="bg-[#EDE4CC] border border-[#C9A227] rounded-xl p-4 flex flex-col sm:flex-row gap-3 justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#7A6A50] absolute left-3 top-3" />
                <input
                  type="search"
                  value={subSearch}
                  onChange={(e) => setSubSearch(e.target.value)}
                  placeholder="Search subscriber email…"
                  aria-label="Search subscribers"
                  className="w-full bg-[#F5EFE0] border border-[#C9A227]/60 rounded-[4px] pl-9 pr-3 py-2 text-sm text-[#3D3520]"
                />
              </div>

              <select
                value={subSort}
                onChange={(e) => setSubSort(e.target.value as 'newest' | 'oldest')}
                aria-label="Sort subscribers by date"
                className="bg-[#F5EFE0] border border-[#C9A227]/60 rounded-[4px] px-3 py-2 text-sm text-[#3D3520]"
              >
                <option value="newest">Sort: Newest first</option>
                <option value="oldest">Sort: Oldest first</option>
              </select>
            </div>

            <div className="bg-[#EDE4CC] border border-[#C9A227] rounded-xl p-4 sm:p-6">
              {dataLoading ? (
                <div className="space-y-3">
                  <div className="h-10 bg-[#F5EFE0] rounded animate-pulse" />
                  <div className="h-10 bg-[#F5EFE0] rounded animate-pulse" />
                </div>
              ) : filteredSubscribers.length === 0 ? (
                <p className="text-center py-8 text-sm text-[#7A6A50]">No subscribers found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-[#C9A227] text-xs uppercase tracking-wider text-[#1A2A4A]">
                        <th scope="col" className="py-3 px-4">
                          Email
                        </th>
                        <th scope="col" className="py-3 px-4">
                          Subscribed on
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C9A227]/30 text-sm">
                      {filteredSubscribers.map((s) => (
                        <tr key={s.id} className="bg-[#F5EFE0]/60 hover:bg-[#F5EFE0]">
                          <td className="py-3.5 px-4 font-bold text-[#1A2A4A]">{s.email}</td>
                          <td className="py-3.5 px-4 text-[#7A6A50] tabular-nums">
                            {formatIstDateTime(s.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 13.5 ACTIVITY LOGS — /admin/logs */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <SectionLabel>UNIFIED AUDIT TABLE</SectionLabel>
                <h2 className="font-serif-heading text-3xl font-bold text-[#1A2A4A]">
                  Activity Logs (Signup, Signin, Logout, Subscriber &amp; Contact Form)
                </h2>
                <p className="text-sm text-[#7A6A50] mt-1">
                  Stored in Firestore collection <code>/activity_logs</code>
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  downloadCsv(
                    'kalyansetu-activity-logs.csv',
                    ['ID', 'Timestamp (IST)', 'Event Type', 'User ID', 'Full Name', 'Email', 'Details'],
                    filteredActivityLogs.map((l) => [
                      l.id,
                      formatIstDateTime(l.createdAt),
                      l.eventType,
                      l.userId,
                      l.fullName,
                      l.email,
                      l.details,
                    ])
                  )
                }
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A2A4A] text-white text-xs font-bold rounded-[4px] hover:bg-[#1A2A4A]/90 transition-colors self-start sm:self-auto cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Logs to CSV</span>
              </button>
            </div>

            <div className="bg-[#EDE4CC] border border-[#C9A227] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#7A6A50] absolute left-3 top-3" />
                <input
                  type="search"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="Search user, email, or details…"
                  aria-label="Search activity logs"
                  className="w-full bg-[#F5EFE0] border border-[#C9A227]/60 rounded-[4px] pl-9 pr-3 py-2 text-sm text-[#3D3520]"
                />
              </div>

              <select
                value={logEventFilter}
                onChange={(e) => setLogEventFilter(e.target.value)}
                aria-label="Filter by event type"
                className="bg-[#F5EFE0] border border-[#C9A227]/60 rounded-[4px] px-3 py-2 text-sm text-[#3D3520]"
              >
                <option value="All">Event Type: All</option>
                <option value="signup">Signup</option>
                <option value="signin">Signin / Login</option>
                <option value="logout">Logout</option>
                <option value="subscriber">Newsletter Subscriber</option>
                <option value="contact_form">Contact Form</option>
              </select>

              <select
                value={logSort}
                onChange={(e) => setLogSort(e.target.value as 'newest' | 'oldest')}
                aria-label="Sort activity logs"
                className="bg-[#F5EFE0] border border-[#C9A227]/60 rounded-[4px] px-3 py-2 text-sm text-[#3D3520]"
              >
                <option value="newest">Sort: Newest first</option>
                <option value="oldest">Sort: Oldest first</option>
              </select>
            </div>

            <div className="bg-[#EDE4CC] border border-[#C9A227] rounded-xl p-4 sm:p-6">
              {dataLoading ? (
                <div className="space-y-3">
                  <div className="h-12 bg-[#F5EFE0] rounded animate-pulse" />
                  <div className="h-12 bg-[#F5EFE0] rounded animate-pulse" />
                </div>
              ) : filteredActivityLogs.length === 0 ? (
                <p className="text-center py-8 text-sm text-[#7A6A50]">
                  No activity logs match the current filters.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-[#C9A227] text-xs uppercase tracking-wider text-[#1A2A4A]">
                        <th scope="col" className="py-3 px-3">Timestamp (IST)</th>
                        <th scope="col" className="py-3 px-3">Event Type</th>
                        <th scope="col" className="py-3 px-3">Name</th>
                        <th scope="col" className="py-3 px-3">Email</th>
                        <th scope="col" className="py-3 px-3">User ID</th>
                        <th scope="col" className="py-3 px-3">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C9A227]/30 text-sm">
                      {filteredActivityLogs.map((log) => (
                        <tr key={log.id} className="bg-[#F5EFE0]/60 hover:bg-[#F5EFE0]">
                          <td className="py-3.5 px-3 whitespace-nowrap text-xs text-[#7A6A50] tabular-nums">
                            {formatIstDateTime(log.createdAt)}
                          </td>
                          <td className="py-3.5 px-3 uppercase text-xs font-bold tracking-wider text-[#1A2A4A] whitespace-nowrap">
                            {log.eventType}
                          </td>
                          <td className="py-3.5 px-3 font-bold text-[#1A2A4A] whitespace-nowrap">
                            {log.fullName}
                          </td>
                          <td className="py-3.5 px-3 text-[#3D3520] whitespace-nowrap">
                            {log.email}
                          </td>
                          <td className="py-3.5 px-3 text-xs text-[#7A6A50] whitespace-nowrap tabular-nums">
                            {log.userId}
                          </td>
                          <td className="py-3.5 px-3 text-[#3D3520]">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MESSAGE DETAIL DRAWER (Section 13.2) */}
      {selectedMessage && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-message-title"
        >
          <div
            className="fixed inset-0 bg-[#1A2A4A]/50 backdrop-blur-xs"
            onClick={() => setSelectedMessage(null)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-lg bg-[#F5EFE0] h-full shadow-2xl border-l-2 border-[#C9A227] z-10 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#C9A227]">
                <div>
                  <span className="text-xs font-bold uppercase tracking-[2px] text-[#C9A227]">
                    MESSAGE #{selectedMessage.id}
                  </span>
                  <h3
                    id="drawer-message-title"
                    className="font-serif-heading text-2xl font-bold text-[#1A2A4A]"
                  >
                    {selectedMessage.fullName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  aria-label="Close message details"
                  className="p-2 text-[#1A2A4A] hover:text-[#C9A227] cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Metadata Grid */}
              <div className="bg-[#EDE4CC] border border-[#C9A227]/50 rounded-lg p-4 text-sm space-y-2">
                <div className="flex justify-between gap-2">
                  <span className="font-bold text-[#1A2A4A]">Email:</span>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="text-[#1A2A4A] underline break-all"
                  >
                    {selectedMessage.email}
                  </a>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="font-bold text-[#1A2A4A]">Phone:</span>
                  <span className="text-[#3D3520] tabular-nums">
                    {selectedMessage.phone || 'Not provided'}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="font-bold text-[#1A2A4A]">Reason:</span>
                  <span className="text-[#3D3520] font-semibold">{selectedMessage.reason}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="font-bold text-[#1A2A4A]">Signed in when sending:</span>
                  <span className="text-[#3D3520]">
                    {selectedMessage.userId ? `Yes (${selectedMessage.email})` : 'No (Guest)'}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="font-bold text-[#1A2A4A]">Received:</span>
                  <span className="text-[#7A6A50] tabular-nums">
                    {formatIstDateTime(selectedMessage.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="font-bold text-[#1A2A4A]">Admin Email Notification:</span>
                  <span className="text-[#1A2A4A] font-bold">
                    {selectedMessage.notifiedAt
                      ? `✓ Sent (${formatIstDateTime(selectedMessage.notifiedAt)})`
                      : `✗ Not sent (${selectedMessage.notificationError || 'Pending'})`}
                  </span>
                </div>
              </div>

              {/* Full Message Text */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A2A4A] mb-2">
                  Full Message
                </h4>
                <div className="bg-white border border-[#C9A227]/60 rounded-lg p-4 text-[#3D3520] text-sm whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Primary Reply & Email Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(
                    `Re: ${selectedMessage.reason} — KalyanSetu`
                  )}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C9A227] text-white font-bold text-sm rounded-[4px] hover:bg-[#b38f20] transition-colors"
                >
                  <span>Reply by email</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={() => handleViewEmailPreview(selectedMessage)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-[#1A2A4A] text-[#1A2A4A] font-bold text-xs rounded-[4px] hover:bg-[#EDE4CC] transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Admin Email HTML</span>
                </button>

                <button
                  type="button"
                  disabled={retryingEmail}
                  onClick={() => handleRetryNotification(selectedMessage)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-[#C9A227] text-[#1A2A4A] font-bold text-xs rounded-[4px] hover:bg-[#EDE4CC] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{retryingEmail ? 'Sending…' : 'Retry notification'}</span>
                </button>
              </div>

              {/* Status Dropdown */}
              <div>
                <label
                  htmlFor="drawer-status-select"
                  className="block text-xs font-bold uppercase tracking-wider text-[#1A2A4A] mb-1.5"
                >
                  Message Status (Saved Immediately)
                </label>
                <select
                  id="drawer-status-select"
                  value={selectedMessage.status}
                  onChange={(e) =>
                    handleStatusChange(
                      selectedMessage.id,
                      e.target.value as 'new' | 'read' | 'replied' | 'archived'
                    )
                  }
                  className="w-full bg-white border border-[#C9A227] rounded-[4px] px-3.5 py-2.5 text-sm font-bold text-[#1A2A4A]"
                >
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Internal Admin Notes */}
              <div>
                <label
                  htmlFor="drawer-admin-notes"
                  className="block text-xs font-bold uppercase tracking-wider text-[#1A2A4A] mb-1.5"
                >
                  Internal Notes (Admin-only, never shown to sender)
                </label>
                <textarea
                  id="drawer-admin-notes"
                  rows={3}
                  maxLength={2000}
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="Add internal team notes or follow-up status…"
                  className="w-full bg-white border border-[#C9A227] rounded-[4px] p-3 text-sm text-[#3D3520]"
                />
                <button
                  type="button"
                  disabled={savingNotes}
                  onClick={handleSaveAdminNotes}
                  className="mt-2 px-5 py-2 bg-[#1A2A4A] text-white text-xs font-bold rounded-[4px] hover:bg-[#1A2A4A]/90 cursor-pointer disabled:opacity-60"
                >
                  {savingNotes ? 'Saving notes…' : 'Save Internal Notes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN EMAIL HTML PREVIEW MODAL */}
      {emailPreviewHtml && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A2A4A]/70 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label="Formatted Admin Notification Email Preview"
        >
          <div className="bg-[#F5EFE0] border-2 border-[#C9A227] rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="bg-[#1A2A4A] text-white px-6 py-4 flex items-center justify-between border-b border-[#C9A227]">
              <h3 className="font-serif-heading text-lg font-bold">
                Formatted Admin Notification Email (Section 15.2)
              </h3>
              <button
                type="button"
                onClick={() => setEmailPreviewHtml(null)}
                aria-label="Close email preview"
                className="text-white hover:text-[#C9A227] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 bg-[#EDE4CC]">
              <iframe
                title="Admin Notification Email Preview"
                srcDoc={emailPreviewHtml}
                className="w-full h-[460px] bg-white rounded border border-[#C9A227]"
              />
            </div>
          </div>
        </div>
      )}

      {/* ROLE CHANGE CONFIRMATION MODAL (Section 13.3) */}
      {roleModalTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A2A4A]/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="role-modal-title"
        >
          <div className="bg-[#F5EFE0] border-2 border-[#C9A227] rounded-xl max-w-md w-full p-7 shadow-2xl">
            <h3
              id="role-modal-title"
              className="font-serif-heading text-2xl font-bold text-[#1A2A4A] mb-3"
            >
              Change user role?
            </h3>
            <p className="text-sm text-[#3D3520] leading-relaxed mb-6">
              Are you sure you want to change{' '}
              <strong>{roleModalTarget.user.fullName || roleModalTarget.user.email}</strong>&apos;s
              role to <strong className="uppercase">{roleModalTarget.nextRole}</strong>?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setRoleModalTarget(null)}
                className="px-5 py-2 border border-[#1A2A4A] text-[#1A2A4A] text-sm font-bold rounded-[4px] hover:bg-[#EDE4CC] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updatingRole}
                onClick={handleConfirmRoleChange}
                className="px-5 py-2 bg-[#C9A227] text-white text-sm font-bold rounded-[4px] hover:bg-[#b38f20] cursor-pointer disabled:opacity-60"
              >
                {updatingRole ? 'Updating…' : 'Confirm Role Change'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
