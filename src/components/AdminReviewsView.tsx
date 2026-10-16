import React, { useState, useEffect } from 'react';
import { UserProfile, UserReview } from '../types';
import {
  ShieldCheck,
  Star,
  Trash2,
  RefreshCw,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Mail,
  ExternalLink,
  Copy,
  Check,
  Download,
  Users,
  MessageSquare,
  Lock,
  UserCheck,
  Shield,
  Clock,
  Calendar,
  Key,
} from 'lucide-react';
import {
  fetchReviewsFromFirestore,
  updateReviewInFirestore,
  deleteReviewFromFirestore,
  fetchAllUsersFromFirestore,
  updateUserRoleInFirestore,
} from '../services/firebase';
import { AuthModal } from './AuthModal';
import { AdminUserDashboard } from './AdminUserDashboard';

interface AdminReviewsViewProps {
  currentUser: UserProfile | null;
  onUserLogin?: (user: UserProfile) => void;
  onNavigateToUsers?: () => void;
}

export const AdminReviewsView: React.FC<AdminReviewsViewProps> = ({
  currentUser,
  onUserLogin,
}) => {
  const [activeTab, setActiveTab] = useState<'reviews' | 'users'>('reviews');

  // Reviews State
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState<boolean>(true);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Users State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);
  const [userSearchTerm, setUserSearchTerm] = useState<string>('');

  // Auth gate modal
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const isAdmin =
    currentUser &&
    (currentUser.role === 'admin' ||
      currentUser.email?.toLowerCase() === 'rayyankolliyath@gmail.com' ||
      currentUser.email?.toLowerCase() === 'mrtech2xx9@gmail.com');

  const loadReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const data = await fetchReviewsFromFirestore();
      setReviews(data);
    } catch (e) {
      console.error('Failed to load reviews from Firestore:', e);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const data = await fetchAllUsersFromFirestore();
      setUsers(data);
    } catch (e) {
      console.error('Failed to load users from Firestore:', e);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadReviews();
      loadUsers();
    }
  }, [isAdmin]);

  const handleStatusChange = async (
    id: string,
    status: 'approved' | 'rejected' | 'pending'
  ) => {
    try {
      await updateReviewInFirestore(id, { status });
      setReviews((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r
        )
      );
    } catch (e) {
      console.error('Error updating review status:', e);
      alert('Failed to update status in Firestore.');
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return;
    try {
      await deleteReviewFromFirestore(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error('Error deleting review:', e);
      alert('Failed to delete review from Firestore.');
    }
  };

  const handleToggleRole = async (userItem: UserProfile) => {
    const newRole = userItem.role === 'admin' ? 'user' : 'admin';
    const confirmMsg = `Are you sure you want to change ${userItem.name}'s role to ${newRole.toUpperCase()}?`;
    if (!confirm(confirmMsg)) return;

    try {
      await updateUserRoleInFirestore(userItem.uid || userItem.id, newRole);
      setUsers((prev) =>
        prev.map((u) =>
          (u.uid || u.id) === (userItem.uid || userItem.id) ? { ...u, role: newRole } : u
        )
      );
    } catch (e) {
      console.error('Error updating role:', e);
      alert('Failed to update user role in Firestore.');
    }
  };

  const handleCopyReview = (rev: UserReview) => {
    const text = `MR TECH AI Review (${rev.rating} Stars):
"${rev.review}"
Review ID: ${rev.id}
Category: ${rev.category}
By: ${rev.userName} (${rev.userEmail})
Firebase UID: ${rev.userId}
Status: ${rev.status || 'pending'}
Date: ${new Date(rev.createdAt || rev.timestamp || '').toLocaleString()}`;
    navigator.clipboard.writeText(text);
    setCopiedId(rev.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    if (reviews.length === 0) return;
    const headers = [
      'Review ID',
      'User UID',
      'User Name',
      'User Email',
      'Rating',
      'Status',
      'Category',
      'Review Content',
      'Device Mode',
      'Created At',
      'Updated At',
    ];
    const rows = reviews.map((r) => [
      r.id,
      r.userId,
      `"${(r.userName || '').replace(/"/g, '""')}"`,
      `"${(r.userEmail || '').replace(/"/g, '""')}"`,
      r.rating,
      r.status || 'pending',
      r.category,
      `"${(r.review || '').replace(/"/g, '""')}"`,
      r.deviceMode || 'auto',
      `"${r.createdAt || r.timestamp || ''}"`,
      `"${r.updatedAt || ''}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mr_tech_ai_reviews_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getGmailUrlForReview = (rev: UserReview) => {
    const subject = `MR TECH AI: ${rev.rating}★ Review from ${rev.userName || rev.userEmail || 'User'}`;
    const body = `MR TECH AI Review Record:
Rating: ${rev.rating} / 5 Stars
Status: ${rev.status}
Review ID: ${rev.id}
Category: ${rev.category}
Review: ${rev.review}
Quick Highlights: ${(rev.quickFeedback && rev.quickFeedback.join(', ')) || 'None'}
Suggestions: ${rev.additionalComments || 'None'}
User UID: ${rev.userId}
Authenticated Email: ${rev.userEmail}
Submitted: ${new Date(rev.createdAt || rev.timestamp || '').toLocaleString()}

---
Admin Workspace: MR TECH AI by RAYYAN`;
    const to = 'mrtech2xx9@gmail.com';
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      to
    )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Filtered reviews
  const filteredReviews = reviews.filter((r) => {
    if (filterRating !== 'all' && r.rating !== filterRating) return false;
    if (filterStatus !== 'all' && (r.status || 'approved') !== filterStatus) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        r.review.toLowerCase().includes(q) ||
        r.userEmail?.toLowerCase().includes(q) ||
        r.userName?.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.userId?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered users
  const filteredUsers = users.filter((u) => {
    if (!userSearchTerm) return true;
    const q = userSearchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.uid || u.id).toLowerCase().includes(q)
    );
  });

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  const pendingCount = reviews.filter((r) => r.status === 'pending').length;
  const approvedCount = reviews.filter((r) => r.status === 'approved').length;

  // Access Denial Gate
  if (!isAdmin) {
    return (
      <div className="w-full min-h-full flex flex-col items-center justify-center p-6 bg-[#090d16] text-slate-100">
        <div className="w-full max-w-md p-8 rounded-3xl bg-[#0B0F1A] border border-slate-800 shadow-2xl flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-lg shadow-red-500/10">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Admin Authorization Required</h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              This panel is restricted exclusively to authorized administrators. Sign in with an approved admin account to manage users and moderate reviews.
            </p>
          </div>

          <button
            onClick={() => setShowAuthModal(true)}
            className="w-full py-3 rounded-xl font-semibold text-xs sm:text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
          >
            <Shield className="w-4 h-4" />
            <span>Sign In with Admin Account</span>
          </button>
        </div>

        {showAuthModal && (
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onSuccess={(loggedUser) => {
              if (onUserLogin) onUserLogin(loggedUser);
              setShowAuthModal(false);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-full flex flex-col p-4 sm:p-6 lg:p-8 bg-[#090d16] text-slate-100">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Administration & Moderation Hub
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                Firestore Connected
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Logged in as <strong className="text-white">{currentUser?.name}</strong> ({currentUser?.email})
            </p>
          </div>
        </div>

        {/* Action buttons & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="flex p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Reviews ({reviews.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Users ({users.length})</span>
            </button>
          </div>

          {activeTab === 'reviews' && (
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#131926] border border-slate-800 hover:border-slate-700 text-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}

          <button
            onClick={() => {
              if (activeTab === 'reviews') loadReviews();
              else loadUsers();
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isLoadingReviews || isLoadingUsers ? 'animate-spin' : ''
              }`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div className="p-4 rounded-2xl bg-[#0B0F1A] border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Total Reviews</span>
            <div className="text-2xl font-bold text-white mt-1">{reviews.length}</div>
          </div>
          <MessageSquare className="w-6 h-6 text-blue-400 opacity-60" />
        </div>

        <div className="p-4 rounded-2xl bg-[#0B0F1A] border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Average Rating</span>
            <div className="text-2xl font-bold text-yellow-400 mt-1 flex items-center gap-1.5">
              <span>{avgRating}</span>
              <Star className="w-5 h-5 fill-yellow-400" />
            </div>
          </div>
          <Star className="w-6 h-6 text-yellow-400 opacity-60" />
        </div>

        <div className="p-4 rounded-2xl bg-[#0B0F1A] border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Approved Reviews</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{approvedCount}</div>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-400 opacity-60" />
        </div>

        <div className="p-4 rounded-2xl bg-[#0B0F1A] border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Registered Users</span>
            <div className="text-2xl font-bold text-cyan-400 mt-1">{users.length}</div>
          </div>
          <Users className="w-6 h-6 text-cyan-400 opacity-60" />
        </div>
      </div>

      {/* Tab 1: Reviews Management */}
      {activeTab === 'reviews' && (
        <div className="flex flex-col gap-5 mt-6">
          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search reviews by text, email, name, UID, or category..."
                className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-[#0B0F1A] border border-slate-800 focus:border-blue-500 focus:outline-none text-slate-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-[#0B0F1A] border border-slate-800 p-1 rounded-xl">
                {(['all', 'approved', 'pending', 'rejected'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                      filterStatus === st
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Rating Filter */}
              <div className="flex items-center gap-1 bg-[#0B0F1A] border border-slate-800 p-1 rounded-xl">
                {(['all', 5, 4, 3, 2, 1] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setFilterRating(r)}
                    className={`px-2 py-1 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                      filterRating === r
                        ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {r === 'all' ? 'All★' : `${r}★`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="flex flex-col gap-3">
            {isLoadingReviews ? (
              <div className="py-16 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
                <span>Fetching reviews from Firestore database...</span>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                No matching reviews found in Firestore.
              </div>
            ) : (
              filteredReviews.map((rev) => {
                const isApproved = rev.status === 'approved';
                const isRejected = rev.status === 'rejected';
                const isPending = !rev.status || rev.status === 'pending';

                return (
                  <div
                    key={rev.id}
                    className="p-5 rounded-2xl bg-[#0B0F1A] border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col gap-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Rating Stars */}
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-4 h-4 ${
                                s <= rev.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-slate-700'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                            isApproved
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : isRejected
                              ? 'bg-red-500/10 text-red-400 border-red-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Pending Moderation'}
                        </span>

                        <span className="text-xs font-medium text-slate-300 px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800">
                          {rev.category}
                        </span>

                        <span className="text-[11px] font-mono text-slate-500">
                          ID: {rev.id.slice(0, 8)}...
                        </span>
                      </div>

                      {/* Moderation Controls */}
                      <div className="flex items-center gap-1.5">
                        {!isApproved && (
                          <button
                            onClick={() => handleStatusChange(rev.id, 'approved')}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 transition-colors cursor-pointer"
                            title="Approve review"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}

                        {!isRejected && (
                          <button
                            onClick={() => handleStatusChange(rev.id, 'rejected')}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 transition-colors cursor-pointer"
                            title="Reject review"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        )}

                        <a
                          href={getGmailUrlForReview(rev)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-900 transition-colors"
                          title="Forward record to Gmail"
                        >
                          <Mail className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => handleCopyReview(rev)}
                          className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
                          title="Copy review record"
                        >
                          {copiedId === rev.id ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
                          title="Permanently delete review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Review text */}
                    <p className="text-sm text-slate-200 leading-relaxed font-sans font-normal">
                      "{rev.review}"
                    </p>

                    {/* Tags */}
                    {rev.quickFeedback && rev.quickFeedback.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {rev.quickFeedback.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded-md bg-[#131926] border border-slate-800 text-[10px] text-blue-300 font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {rev.additionalComments && (
                      <p className="text-xs text-slate-400 italic bg-slate-950/60 p-2.5 rounded-xl border border-slate-900">
                        <strong>Feature suggestion:</strong> {rev.additionalComments}
                      </p>
                    )}

                    {/* Reviewer Account Card Details */}
                    <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 pt-3 border-t border-slate-800/80 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{rev.userName}</span>
                        <span className="text-blue-400 font-sans">({rev.userEmail})</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">
                          UID: {rev.userId}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(rev.createdAt || rev.timestamp || '').toLocaleString()}
                        </span>
                        {rev.deviceMode && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800">
                            {rev.deviceMode}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Registered Users Management (Admin User Information Dashboard) */}
      {activeTab === 'users' && (
        <div className="mt-4">
          <AdminUserDashboard
            currentUser={currentUser}
            onUserRoleChange={(updatedUser) => {
              setUsers((prev) =>
                prev.map((u) =>
                  (u.id || u.uid) === (updatedUser.id || updatedUser.uid) ? updatedUser : u
                )
              );
            }}
          />
        </div>
      )}
    </div>
  );
};
