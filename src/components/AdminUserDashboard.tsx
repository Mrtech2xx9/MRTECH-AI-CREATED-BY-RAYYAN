import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, UserType, AdminNotification } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  GraduationCap,
  Briefcase,
  HelpCircle,
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  Download,
  Eye,
  X,
  Mail,
  Copy,
  Check,
  Calendar,
  Clock,
  Key,
  ChevronRight,
  ExternalLink,
  Shield,
  UserCheck,
  Sparkles,
  Phone,
  Bell,
  Trash2,
  CheckCheck,
} from 'lucide-react';
import {
  fetchAllUsersFromFirestore,
  updateUserRoleInFirestore,
  isUserAdmin,
  fetchAdminNotificationsFromFirestore,
  markAdminNotificationAsRead,
  deleteAdminNotification,
} from '../services/firebase';

interface AdminUserDashboardProps {
  currentUser: UserProfile | null;
  onNavigateToChat?: () => void;
  onUserRoleChange?: (updatedUser: UserProfile) => void;
}

export const AdminUserDashboard: React.FC<AdminUserDashboardProps> = ({
  currentUser,
  onNavigateToChat,
  onUserRoleChange,
}) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // User Profile Detail Modal
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState<boolean>(false);

  const authorized = isUserAdmin(currentUser);

  const loadUsers = async () => {
    if (!authorized) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [fetchedUsers, fetchedNotifs] = await Promise.all([
        fetchAllUsersFromFirestore(),
        fetchAdminNotificationsFromFirestore(),
      ]);
      setUsers(fetchedUsers);
      setNotifications(fetchedNotifs);
    } catch (err: any) {
      console.error('Failed to load registered users from Firestore:', err);
      setErrorMessage(
        err?.message || 'Unauthorized: Access to users collection was denied by Firestore Security Rules.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismissNotification = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await deleteAdminNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.warn('Failed to delete notification:', err);
    }
  };

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await markAdminNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.warn('Failed to mark notification as read:', err);
    }
  };

  useEffect(() => {
    if (authorized) {
      loadUsers();
    }
  }, [authorized]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    let students = 0;
    let working = 0;
    let other = 0;

    users.forEach((u) => {
      const type = (u.userType || '').toLowerCase();
      if (type.includes('student')) {
        students++;
      } else if (type.includes('job') || type.includes('working')) {
        working++;
      } else {
        other++;
      }
    });

    return { total, students, working, other };
  }, [users]);

  // Filtered & Sorted Users
  const filteredUsers = useMemo(() => {
    let list = [...users];

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.id?.toLowerCase().includes(q) ||
          u.uid?.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (filterType !== 'all') {
      list = list.filter((u) => {
        const t = (u.userType || '').toLowerCase();
        if (filterType === 'student') return t.includes('student');
        if (filterType === 'job') return t.includes('job') || t.includes('working');
        if (filterType === 'other') {
          return !t.includes('student') && !t.includes('job') && !t.includes('working');
        }
        return true;
      });
    }

    // Sort: newest or oldest
    list.sort((a, b) => {
      const timeA = new Date(a.createdAt || a.lastLoginAt || 0).getTime();
      const timeB = new Date(b.createdAt || b.lastLoginAt || 0).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return list;
  }, [users, searchTerm, filterType, sortOrder]);

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleToggleRole = async (targetUser: UserProfile) => {
    if (!targetUser.id && !targetUser.uid) return;
    const uid = targetUser.id || targetUser.uid || '';
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';

    if (
      newRole === 'user' &&
      targetUser.email?.toLowerCase() === currentUser?.email?.toLowerCase()
    ) {
      alert('You cannot demote yourself from administrator privileges.');
      return;
    }

    const confirmMsg = `Are you sure you want to ${
      newRole === 'admin' ? 'PROMOTE' : 'DEMOTE'
    } ${targetUser.name || targetUser.email} to ${newRole === 'admin' ? 'Administrator' : 'Standard User'}?`;

    if (!window.confirm(confirmMsg)) return;

    setIsUpdatingRole(true);
    try {
      await updateUserRoleInFirestore(uid, newRole);
      const updated = { ...targetUser, role: newRole };
      setUsers((prev) => prev.map((u) => ((u.id || u.uid) === uid ? updated : u)));
      if (selectedUser && (selectedUser.id === uid || selectedUser.uid === uid)) {
        setSelectedUser(updated);
      }
      if (onUserRoleChange) {
        onUserRoleChange(updated);
      }
    } catch (err: any) {
      alert(`Failed to update role: ${err?.message || 'Firestore update failed'}`);
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredUsers.length === 0) return;
    const headers = [
      'Firebase UID',
      'Full Name',
      'Gmail / Email',
      'Phone Number',
      'Age',
      'User Type',
      'Login Provider',
      'Role',
      'Account Creation Date',
      'Last Login Date',
    ];

    const rows = filteredUsers.map((u) => [
      `"${u.uid || u.id || ''}"`,
      `"${(u.name || '').replace(/"/g, '""')}"`,
      `"${u.email || ''}"`,
      `"${u.phone || 'N/A'}"`,
      u.age ?? 'N/A',
      `"${u.userType || 'Unassigned'}"`,
      `"${u.providerId || 'password'}"`,
      `"${u.role || 'user'}"`,
      `"${u.createdAt ? new Date(u.createdAt).toISOString() : ''}"`,
      `"${u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mrtech_users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. PRIVACY & SECURITY GUARD:
  // If the user is not an authorized administrator, render a secure access denied gate.
  if (!authorized) {
    return (
      <div className="w-full h-full min-h-[500px] flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-[#0E1526] border border-red-500/30 text-center flex flex-col items-center gap-4 shadow-2xl shadow-red-950/40">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Administrator Privileges Required</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              This dashboard is strictly protected. Only authorized system administrators are permitted to view registered users' private profile information.
            </p>
          </div>
          <div className="w-full p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-500 text-left">
            <div>Security Policy: Role-Based Access Control (RBAC)</div>
            <div>Firestore Rules: match /users/&#123;userId&#125; &#123; allow read: if isOwner(userId) || isAdmin(); &#125;</div>
            <div className="text-red-400 mt-1">Status: Access Denied</div>
          </div>
          {onNavigateToChat && (
            <button
              onClick={onNavigateToChat}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              Return to Chat
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Admin User Information Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-mono font-bold uppercase">
              Admin Only
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Securely manage all registered MR TECH AI accounts, review profile completion details, and monitor platform demographics.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={loadUsers}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh user records from Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
            <span>{isLoading ? 'Syncing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={filteredUsers.length === 0}
            className="px-3.5 py-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40"
            title="Export filtered records to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
          <div className="flex-1">{errorMessage}</div>
          <button
            onClick={loadUsers}
            className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Bento Stat Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Users */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1526] border border-blue-500/20 flex flex-col justify-between gap-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Users
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white font-mono">
              {stats.total}
            </span>
            <span className="text-[10px] text-blue-400 font-mono">Registered</span>
          </div>
        </div>

        {/* Total Students */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1526] border border-cyan-500/20 flex flex-col justify-between gap-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Students
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white font-mono">
              {stats.students}
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">
              {stats.total > 0 ? Math.round((stats.students / stats.total) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Total Working / Job */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1526] border border-emerald-500/20 flex flex-col justify-between gap-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Working / Job
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white font-mono">
              {stats.working}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">
              {stats.total > 0 ? Math.round((stats.working / stats.total) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Total Other */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1526] border border-purple-500/20 flex flex-col justify-between gap-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Other
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white font-mono">
              {stats.other}
            </span>
            <span className="text-[10px] text-purple-400 font-mono">
              {stats.total > 0 ? Math.round((stats.other / stats.total) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Real-Time Admin Alerts: "1 person is login your ai" */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1526] border border-blue-500/30 flex flex-col gap-3.5 shadow-lg shadow-blue-950/40 relative overflow-hidden">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40">
                <Bell className="w-4 h-4" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">Live Admin Login Notifications</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {notifications.filter((n) => !n.read).length > 0
                    ? `${notifications.filter((n) => !n.read).length} Unread Alert${notifications.filter((n) => !n.read).length > 1 ? 's' : ''}`
                    : 'All Caught Up'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Live alerts triggered when a user completes their profile with Gmail, Age, and Phone: <strong className="text-emerald-300">"1 person is login your ai"</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAlertsOpen(!isAlertsOpen)}
              className="px-3 py-1.5 rounded-xl bg-[#090D16] hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
            >
              {isAlertsOpen ? 'Collapse Alerts' : `Show Alerts (${notifications.length})`}
            </button>
          </div>
        </div>

        {isAlertsOpen && (
          <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-800/80">
            {notifications.length === 0 ? (
              <div className="py-6 px-4 rounded-xl bg-[#090D16]/60 border border-slate-800/80 text-center flex flex-col items-center justify-center gap-1.5 text-slate-400">
                <Bell className="w-6 h-6 text-slate-600" />
                <span className="text-xs font-medium text-slate-300">No active login notifications recorded yet.</span>
                <span className="text-[11px] text-slate-500">
                  When a user logs into MR TECH AI and provides their Gmail, Age, and Phone, an automated notice <span className="text-blue-300">"1 person is login your ai"</span> will show here in real-time.
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col gap-2 ${
                      notif.read
                        ? 'bg-[#090D16]/70 border-slate-800/70 text-slate-400'
                        : 'bg-[#0b1222] border-blue-500/40 text-slate-200 shadow-md shadow-blue-950/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold shrink-0">
                          <UserCheck className="w-3 h-3 text-emerald-400" />
                          LOGIN EVENT
                        </span>
                        <span className="text-xs font-bold text-white truncate">
                          {notif.title || '1 person is login your ai'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                        {notif.timestamp ? new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#060911] border border-slate-800 text-xs flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">User Name:</span>
                        <span className="font-semibold text-white">{notif.userName || 'Unknown User'}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-400 text-[11px] shrink-0">Gmail:</span>
                        <span className="font-mono text-blue-300 text-[11px] truncate select-all">{notif.userEmail || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">Age:</span>
                        <span className="font-mono text-slate-200">{notif.age ? `${notif.age} yrs` : 'Not set'}</span>
                      </div>
                      {notif.phone && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-400 text-[11px] flex items-center gap-1 shrink-0">
                            <Phone className="w-3 h-3 text-emerald-400" /> Phone:
                          </span>
                          <span className="font-mono text-emerald-300 text-[11px] truncate select-all">{notif.phone}</span>
                        </div>
                      )}
                      {notif.userType && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-[11px]">Type:</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300 font-medium">
                            {notif.userType}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <div className="text-[10px] text-slate-500 font-mono">
                        UID: {(notif.userId || '').slice(0, 10)}...
                      </div>
                      <div className="flex items-center gap-1.5">
                        {!notif.read && (
                          <button
                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-slate-300 flex items-center gap-1 cursor-pointer"
                            title="Mark as read"
                          >
                            <CheckCheck className="w-3 h-3 text-blue-400" />
                            <span>Mark Read</span>
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDismissNotification(notif.id, e)}
                          className="p-1 rounded bg-slate-800/80 hover:bg-red-950/60 hover:text-red-300 text-slate-400 text-[10px] cursor-pointer"
                          title="Delete alert"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0E1526] border border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name, email, or UID..."
            className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-[#090D16] border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-100 placeholder:text-slate-500 outline-none transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* User Type Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <div className="flex items-center gap-1 bg-[#090D16] p-1 rounded-xl border border-slate-800 shrink-0">
            {[
              { id: 'all', label: 'All Types' },
              { id: 'student', label: 'Student' },
              { id: 'job', label: 'Job / Working' },
              { id: 'other', label: 'Other' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterType === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className="px-3 py-1.5 rounded-xl bg-[#090D16] border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            title="Toggle sort direction"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" />
            <span>{sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
          </button>
        </div>
      </div>

      {/* Users Count Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-300">{filteredUsers.length}</strong> of{' '}
          <strong className="text-slate-300">{users.length}</strong> registered accounts
        </span>
        {searchTerm && (
          <span className="text-blue-400">Filtered by query: "{searchTerm}"</span>
        )}
      </div>

      {/* Table / Cards Container */}
      <div className="w-full rounded-2xl bg-[#0E1526] border border-slate-800 overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
            <span className="text-xs font-medium">Fetching verified users from Firestore database...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center p-6 text-slate-500">
            <Users className="w-10 h-10 mb-3 text-slate-700 stroke-1" />
            <div className="text-sm font-semibold text-slate-300">No users match criteria</div>
            <div className="text-xs text-slate-500 max-w-sm mt-1">
              Try adjusting your search query or user type filter.
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead className="bg-[#090D16] border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                  <tr>
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-3">Age</th>
                    <th className="py-3 px-3">User Type</th>
                    <th className="py-3 px-4">Gmail / Email</th>
                    <th className="py-3 px-3">Phone Number</th>
                    <th className="py-3 px-3">Login Provider</th>
                    <th className="py-3 px-3">Account Created</th>
                    <th className="py-3 px-3">Last Login</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredUsers.map((u) => {
                    const isStudent = (u.userType || '').toLowerCase().includes('student');
                    const isWorking =
                      (u.userType || '').toLowerCase().includes('job') ||
                      (u.userType || '').toLowerCase().includes('working');
                    const isOther = !isStudent && !isWorking;
                    const isSystemAdmin = u.role === 'admin';

                    const avatarUrl =
                      u.avatar ||
                      u.photoURL ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                        u.email || u.id || 'user'
                      )}&backgroundColor=090d16`;

                    return (
                      <tr
                        key={u.uid || u.id}
                        className="hover:bg-slate-900/40 transition-colors group cursor-pointer"
                        onClick={() => setSelectedUser(u)}
                      >
                        {/* Full Name & Avatar */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={avatarUrl}
                              alt={u.name || 'User'}
                              className="w-8 h-8 rounded-xl object-cover border border-slate-700 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-white flex items-center gap-1.5 truncate">
                                <span>{u.name || 'Anonymous User'}</span>
                                {isSystemAdmin && (
                                  <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono truncate">
                                UID: {(u.uid || u.id || '').slice(0, 10)}...
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Age */}
                        <td className="py-3.5 px-3 font-mono font-semibold text-slate-200">
                          {u.age ? (
                            <span>{u.age} yrs</span>
                          ) : (
                            <span className="text-slate-600 italic">Not set</span>
                          )}
                        </td>

                        {/* User Type */}
                        <td className="py-3.5 px-3">
                          {u.userType ? (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                                isStudent
                                  ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                                  : isWorking
                                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                  : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                              }`}
                            >
                              {isStudent && <GraduationCap className="w-3 h-3" />}
                              {isWorking && <Briefcase className="w-3 h-3" />}
                              {isOther && <HelpCircle className="w-3 h-3" />}
                              <span>{u.userType}</span>
                            </span>
                          ) : (
                            <span className="text-slate-600 text-[11px] italic">Incomplete</span>
                          )}
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-4 font-mono text-slate-300 truncate max-w-[190px]">
                          <div className="truncate" title={u.email}>
                            {u.email}
                          </div>
                        </td>

                        {/* Phone Number */}
                        <td className="py-3.5 px-3 font-mono text-xs text-emerald-300">
                          {u.phone ? (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="truncate max-w-[130px]">{u.phone}</span>
                            </span>
                          ) : (
                            <span className="text-slate-600 italic text-[11px]">No phone</span>
                          )}
                        </td>

                        {/* Login Provider */}
                        <td className="py-3.5 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-[#090D16] border border-slate-800 text-[10px] font-mono text-slate-400">
                            {u.providerId === 'google.com' ? 'Google' : 'Email/Pass'}
                          </span>
                        </td>

                        {/* Account Creation Date */}
                        <td className="py-3.5 px-3 text-slate-400 text-[11px] font-mono">
                          {u.createdAt ? (
                            <div>
                              <div>{new Date(u.createdAt).toLocaleDateString()}</div>
                              <div className="text-[10px] text-slate-600">
                                {new Date(u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-600">N/A</span>
                          )}
                        </td>

                        {/* Last Login Date */}
                        <td className="py-3.5 px-3 text-slate-400 text-[11px] font-mono">
                          {u.lastLoginAt ? (
                            <div>
                              <div>{new Date(u.lastLoginAt).toLocaleDateString()}</div>
                              <div className="text-[10px] text-slate-600">
                                {new Date(u.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-600">N/A</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(u);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden divide-y divide-slate-800/80">
              {filteredUsers.map((u) => {
                const isStudent = (u.userType || '').toLowerCase().includes('student');
                const isWorking =
                  (u.userType || '').toLowerCase().includes('job') ||
                  (u.userType || '').toLowerCase().includes('working');
                const isSystemAdmin = u.role === 'admin';

                const avatarUrl =
                  u.avatar ||
                  u.photoURL ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                    u.email || u.id || 'user'
                  )}&backgroundColor=090d16`;

                return (
                  <div
                    key={u.uid || u.id}
                    onClick={() => setSelectedUser(u)}
                    className="p-4 flex flex-col gap-3 hover:bg-slate-900/30 transition-colors cursor-pointer active:bg-slate-900/60"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={avatarUrl}
                          alt={u.name || 'User'}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-white flex items-center gap-1.5 text-sm">
                            <span className="truncate">{u.name || 'Anonymous User'}</span>
                            {isSystemAdmin && (
                              <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 font-mono truncate">{u.email}</div>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {u.age ? (
                        <span className="px-2 py-0.5 rounded-md bg-[#090D16] border border-slate-800 text-slate-300 font-mono">
                          Age: {u.age} yrs
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-[#090D16] border border-slate-800 text-slate-500 italic">
                          No age
                        </span>
                      )}

                      {u.phone && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-mono flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>{u.phone}</span>
                        </span>
                      )}

                      {u.userType && (
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${
                            isStudent
                              ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                              : isWorking
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                          }`}
                        >
                          {u.userType}
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded-md bg-[#090D16] border border-slate-800 text-[10px] font-mono text-slate-400">
                        {u.providerId === 'google.com' ? 'Google' : 'Email'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                      <span>Joined: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</span>
                      <span>Last Login: {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Recent'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* User Complete Profile Modal ("Open a user's complete profile" & "View individual user information") */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
          onClick={() => setSelectedUser(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#0E1526] border border-blue-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-blue-950/60 text-slate-100 flex flex-col gap-5 relative animate-fade-in"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={
                    selectedUser.avatar ||
                    selectedUser.photoURL ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                      selectedUser.email || selectedUser.id || 'user'
                    )}&backgroundColor=090d16`
                  }
                  alt={selectedUser.name || 'User'}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500/40 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{selectedUser.name || 'Anonymous User'}</h3>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.2 rounded-full border ${
                        selectedUser.role === 'admin'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 font-bold'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {selectedUser.role === 'admin' ? 'Administrator' : 'Standard User'}
                    </span>
                  </div>
                  <div className="text-xs text-blue-400 font-mono mt-0.5">{selectedUser.email}</div>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Attributes Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Age */}
              <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800/90 flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase text-slate-500">Age</span>
                <span className="text-sm font-bold text-white font-mono">
                  {selectedUser.age ? `${selectedUser.age} years old` : 'Not provided'}
                </span>
              </div>

              {/* User Type */}
              <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800/90 flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase text-slate-500">User Type</span>
                <span className="text-sm font-bold text-cyan-300">
                  {selectedUser.userType || 'Incomplete'}
                </span>
              </div>

              {/* Login Provider */}
              <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800/90 flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase text-slate-500">Login Provider</span>
                <span className="text-xs font-semibold text-slate-200">
                  {selectedUser.providerId === 'google.com' ? 'Google Sign-In' : 'Email & Password'}
                </span>
              </div>

              {/* Profile Completion Status */}
              <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800/90 flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase text-slate-500">Profile Status</span>
                <span
                  className={`text-xs font-semibold ${
                    selectedUser.profileCompleted || (selectedUser.age && selectedUser.userType && selectedUser.phone)
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}
                >
                  {selectedUser.profileCompleted || (selectedUser.age && selectedUser.userType && selectedUser.phone)
                    ? 'Verified & Complete'
                    : 'Pending Details'}
                </span>
              </div>
            </div>

            {/* Phone Number Box */}
            <div className="p-3 rounded-xl bg-[#090D16] border border-emerald-500/30 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-mono uppercase text-emerald-400 flex items-center gap-1.5 font-bold">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Phone Number</span>
                </div>
                <div className="text-xs font-mono text-white truncate mt-0.5">
                  {selectedUser.phone || 'No phone number provided'}
                </div>
              </div>
              {selectedUser.phone && (
                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={`tel:${selectedUser.phone}`}
                    className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 transition-colors text-xs font-mono"
                    title="Call Phone"
                  >
                    Call
                  </a>
                  <button
                    onClick={() => handleCopy(selectedUser.phone || '', 'phone')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
                    title="Copy Phone"
                  >
                    {copiedField === 'phone' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Gmail / Email Box */}
            <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-mono uppercase text-slate-500 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-red-400" />
                  <span>Gmail / Email</span>
                </div>
                <div className="text-xs font-mono text-slate-200 truncate mt-0.5">
                  {selectedUser.email}
                </div>
              </div>
              <button
                onClick={() => handleCopy(selectedUser.email || '', 'email')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
                title="Copy Email"
              >
                {copiedField === 'email' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Firebase UID Box */}
            <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-mono uppercase text-slate-500 flex items-center gap-1">
                  <Key className="w-3 h-3 text-blue-400" />
                  <span>Firebase UID</span>
                </div>
                <div className="text-xs font-mono text-slate-300 truncate mt-0.5">
                  {selectedUser.uid || selectedUser.id}
                </div>
              </div>
              <button
                onClick={() => handleCopy(selectedUser.uid || selectedUser.id, 'uid')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
                title="Copy UID"
              >
                {copiedField === 'uid' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Timestamps */}
            <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800 flex flex-col gap-2 text-xs font-mono text-slate-400">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  Account Creation Date:
                </span>
                <span className="text-slate-200">
                  {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  Last Login Date:
                </span>
                <span className="text-slate-200">
                  {selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>

            {/* Admin Actions Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 gap-3">
              <a
                href={`mailto:${selectedUser.email}?subject=Regarding%20your%20MR%20TECH%20AI%20Account`}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>Email User</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleRole(selectedUser)}
                  disabled={isUpdatingRole}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    selectedUser.role === 'admin'
                      ? 'bg-red-950/40 hover:bg-red-950/70 text-red-300 border-red-900/50'
                      : 'bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border-blue-500/40'
                  }`}
                >
                  {selectedUser.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                </button>

                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
