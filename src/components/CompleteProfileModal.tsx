import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile, UserType } from '../types';
import { MrTechLogo } from './MrTechLogo';
import {
  GraduationCap,
  Briefcase,
  HelpCircle,
  Check,
  ArrowRight,
  User,
  Calendar,
  Phone,
  Mail,
  LogOut,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { updateUserProfileDetails } from '../services/firebase';

interface CompleteProfileModalProps {
  user: UserProfile;
  onComplete: (updatedUser: UserProfile) => void;
  onLogout: () => void;
}

const USER_TYPES: Array<{
  type: UserType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeBg: string;
}> = [
  {
    type: 'Student',
    label: 'Student',
    description: 'School, College, or University Learner',
    icon: GraduationCap,
    accentColor: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/30',
    badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
  },
  {
    type: 'Job / Working',
    label: 'Job / Working',
    description: 'Employed, Professional, or Freelancer',
    icon: Briefcase,
    accentColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30',
    badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  },
  {
    type: 'Other',
    label: 'Other',
    description: 'Researcher, Independent, or Enthusiast',
    icon: HelpCircle,
    accentColor: 'text-purple-400 border-purple-500/40 bg-purple-950/30',
    badgeBg: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
  },
];

export const CompleteProfileModal: React.FC<CompleteProfileModalProps> = ({
  user,
  onComplete,
  onLogout,
}) => {
  const [name, setName] = useState<string>(user.name || '');
  const [email, setEmail] = useState<string>(user.email || '');
  const [age, setAge] = useState<string>(user.age ? String(user.age) : '');
  const [phone, setPhone] = useState<string>(user.phone || '');
  const [selectedType, setSelectedType] = useState<UserType | null>(user.userType || null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setErrorMsg('Please enter a valid Gmail / Email address.');
      return;
    }

    const numAge = parseInt(age, 10);
    if (isNaN(numAge) || numAge < 5 || numAge > 120) {
      setErrorMsg('Please enter a valid age between 5 and 120.');
      return;
    }

    const trimmedPhone = phone.trim();
    const digitsOnly = trimmedPhone.replace(/\D/g, '');
    if (!trimmedPhone || digitsOnly.length < 7) {
      setErrorMsg('Please enter a valid phone number with at least 7 digits (e.g. +91 9876543210).');
      return;
    }

    if (!selectedType) {
      setErrorMsg('Please select your user type (Student, Job / Working, or Other).');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateUserProfileDetails(user.id || user.uid || '', {
        name: trimmedName,
        email: trimmedEmail,
        age: numAge,
        phone: trimmedPhone,
        userType: selectedType,
      });

      const updatedProfile: UserProfile = {
        ...user,
        name: trimmedName,
        email: trimmedEmail,
        age: numAge,
        phone: trimmedPhone,
        userType: selectedType,
        profileCompleted: true,
      };

      onComplete(updatedProfile);
    } catch (err: any) {
      console.error('Failed to update user profile in Firestore:', err);
      setErrorMsg(err?.message || 'Could not save profile details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg my-6 bg-[#0E1526] border border-blue-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-blue-950/50 text-slate-100 flex flex-col gap-4 relative overflow-hidden"
      >
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding & Header */}
        <div className="flex flex-col items-center text-center gap-1.5">
          <MrTechLogo size="md" showSubtitle={true} showCreator={false} />

          <div className="mt-1 flex items-center gap-2 px-3 py-0.5 rounded-full bg-blue-950/80 border border-blue-500/30 text-[11px] font-mono text-blue-300">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Profile Verification Required</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            Complete Your Profile
          </h2>
          <p className="text-xs text-slate-400 max-w-sm">
            Please fill in your Gmail, Age, Phone number, and User Type to verify your login and personalize MR TECH AI.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Profile Completion Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Field 1: Full Name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-400" />
                Full Name <span className="text-red-400">*</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">Official display name</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Johnson"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#090D16] border border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-white placeholder:text-slate-600 outline-none transition-all"
            />
          </div>

          {/* Field 2: Gmail / Email */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-red-400" />
                Gmail / Email Address <span className="text-red-400">*</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">Official Google / Email</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@gmail.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#090D16] border border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-white placeholder:text-slate-600 outline-none transition-all"
            />
          </div>

          {/* Two Columns: Age and Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Field 3: Age */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  Age <span className="text-red-400">*</span>
                </span>
                <span className="text-[10px] text-slate-500 font-normal">Years (5-120)</span>
              </label>
              <input
                type="number"
                required
                min={5}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 21"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090D16] border border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-white placeholder:text-slate-600 outline-none transition-all"
              />
            </div>

            {/* Field 4: Phone Number */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  Phone Number <span className="text-red-400">*</span>
                </span>
                <span className="text-[10px] text-slate-500 font-normal">Phone with code</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090D16] border border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-white placeholder:text-slate-600 outline-none transition-all"
              />
            </div>
          </div>

          {/* Field 3: User Type Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>
                User Type <span className="text-red-400">*</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">Select one category</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {USER_TYPES.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedType === item.type;

                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setSelectedType(item.type)}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer relative ${
                      isSelected
                        ? `${item.accentColor} ring-1 ring-blue-400/50 shadow-lg shadow-blue-950/40`
                        : 'bg-[#090D16] border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800/80 text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'bg-blue-500 border-blue-400 text-white'
                            : 'border-slate-700 bg-transparent'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>

                    <div>
                      <div className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                        {item.label}
                      </div>
                      <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account info preview */}
          <div className="mt-1 p-3 rounded-xl bg-[#090D16]/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <div className="truncate">
              <span className="text-slate-500">Connected account: </span>
              <span className="text-slate-300 font-mono font-medium truncate">{email || user.email}</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-blue-400 shrink-0 ml-2">
              {user.providerId === 'google.com' ? 'Google' : 'Email'}
            </span>
          </div>

          {/* Admin Notification Banner */}
          <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/20 text-[11px] text-blue-300/90 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Upon verification, an active login notification is securely transmitted to the admin console: <strong>"1 person is login your ai"</strong>.</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !name.trim() || !email.trim() || !age || !phone.trim() || !selectedType}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <span>Save & Continue to MR TECH AI</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Logout Option */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-500">
          <span>Wrong account?</span>
          <button
            type="button"
            onClick={onLogout}
            className="text-red-400 hover:text-red-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
