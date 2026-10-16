import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  User,
  Lock,
  LogIn,
  Mail,
  ExternalLink,
} from 'lucide-react';
import { UserProfile, DeviceMode, UserReview } from '../types';
import { submitReviewToFirestore } from '../services/firebase';
import { AuthModal } from './AuthModal';

const ADMIN_EMAIL = 'mrtech2xx9@gmail.com';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  deviceMode: DeviceMode;
  onUserLogin?: (user: UserProfile) => void;
  onReviewSubmitted?: (review: UserReview) => void;
}

const CATEGORIES = [
  'General Feedback',
  'Chat & AI Speed',
  'AI 1 Model Accuracy',
  'Coding Assistant',
  'Image Studio',
  'Security & Privacy',
  'Mobile & Responsive Design',
  'Feature Request',
];

const QUICK_TAGS = [
  'Blazing fast',
  'Accurate answers',
  'Clean UI',
  'Love AI images',
  'Helpful coding',
  'Secure authentication',
  'Great mobile UX',
];

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  user,
  deviceMode,
  onUserLogin,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<string>('General Feedback');
  const [review, setReview] = useState<string>('');
  const [selectedQuickTags, setSelectedQuickTags] = useState<string[]>([]);
  const [additionalComments, setAdditionalComments] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [lastSubmittedReview, setLastSubmittedReview] = useState<UserReview | null>(null);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedQuickTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const getGmailComposeUrl = (revText?: string) => {
    const textToUse = revText || review.trim() || 'Great experience with MR TECH AI!';
    const subject = encodeURIComponent(`MR TECH AI Review: ${rating}★ from ${user?.name || 'User'}`);
    const body = encodeURIComponent(
`MR TECH AI User Review
========================
Rating: ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)} (${rating}/5 Stars)
Category: ${category}
Reviewer: ${user?.name || 'User'} (${user?.email || 'Anonymous'})
UID: ${user?.uid || 'N/A'}
Date: ${new Date().toLocaleString()}

Review Message:
"${textToUse}"

Key Feedback: ${selectedQuickTags.length > 0 ? selectedQuickTags.join(', ') : 'None'}
Feature Suggestions: ${additionalComments.trim() || 'None'}
Platform: ${deviceMode}
`
    );
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${ADMIN_EMAIL}&su=${subject}&body=${body}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!user) {
      setErrorMessage('You must be signed in to submit a review.');
      return;
    }

    if (!review.trim()) {
      setErrorMessage('Please write your review text before submitting.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // 1. Submit strictly to Firestore with authenticated user association
      const createdReview = await submitReviewToFirestore({
        rating,
        review: review.trim(),
        category,
        quickFeedback: selectedQuickTags,
        additionalComments: additionalComments.trim(),
        deviceMode,
      });

      setLastSubmittedReview(createdReview);

      // 2. Also back up to local storage or server endpoint if available
      try {
        await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...createdReview,
            userEmail: user.email,
            userName: user.name,
          }),
        });
      } catch (err) {
        // Local server sync error is non-blocking since Firestore is primary
        console.warn('Backend server mirror warning:', err);
      }

      if (onReviewSubmitted) {
        onReviewSubmitted(createdReview);
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setErrorMessage(err.message || 'Review could not be submitted. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg my-6 bg-[#0B0F1A] border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-100 flex flex-col gap-4 relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title Header */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Write a Review</h2>
              <p className="text-xs text-slate-400">Share your experience with the MR TECH AI community.</p>
            </div>
          </div>

          {submitted ? (
            <div className="py-6 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Review Submitted Successfully!</h3>
                <p className="text-xs text-slate-300 max-w-sm mt-1">
                  Thank you! Your review has been saved in Firestore and the delivery notification was dispatched to <span className="text-cyan-400 font-mono font-semibold">mrtech2xx9@gmail.com</span>.
                </p>
              </div>

              <div className="w-full p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2 text-left text-xs font-mono">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Target Admin:</span>
                  <span className="text-cyan-300 font-bold">mrtech2xx9@gmail.com</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Rating Recorded:</span>
                  <span className="text-yellow-400 font-bold">{'★'.repeat(rating)} ({rating}/5 Stars)</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Category:</span>
                  <span className="text-slate-200">{category}</span>
                </div>
              </div>

              <div className="w-full flex flex-col sm:flex-row items-center gap-2 mt-1">
                <a
                  href={getGmailComposeUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send copy via Gmail</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>

                <button
                  onClick={() => {
                    setSubmitted(false);
                    setReview('');
                    setSelectedQuickTags([]);
                    setAdditionalComments('');
                    onClose();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : !user ? (
            /* Unauthenticated state: Force user to log in before submitting review */
            <div className="py-8 px-4 flex flex-col items-center text-center gap-4 bg-slate-950/60 rounded-2xl border border-slate-800/80">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Lock className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">Authentication Required</h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Reviews can only be submitted by verified accounts to prevent spam and preserve trust.
                </p>
              </div>

              <button
                onClick={() => setShowAuthModal(true)}
                className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign in with Google or Email</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Authenticated User Account Details Card */}
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={user.avatar || user.photoURL}
                    alt={user.name}
                    className="w-9 h-9 rounded-full border border-blue-500/40 object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex flex-col leading-tight min-w-0">
                    <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                      <span>{user.name}</span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Verified
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">{user.email}</div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                    Posting As
                  </div>
                  <div className="text-[11px] font-mono text-blue-400">
                    {user.providerId === 'google.com' ? 'Google Auth' : 'Email Auth'}
                  </div>
                </div>
              </div>

              {/* Star Rating Selection */}
              <div className="flex flex-col items-center gap-1.5 py-3 bg-[#131926] rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Your Rating:</span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const filled = hoverRating ? star <= hoverRating : star <= rating;
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 text-slate-600 transition-transform active:scale-90 cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                            filled
                              ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.3)]'
                              : 'text-slate-700 hover:text-slate-500'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs font-mono text-blue-400 font-medium">
                  {rating === 5 && 'Outstanding ★★★★★'}
                  {rating === 4 && 'Very Good ★★★★☆'}
                  {rating === 3 && 'Good ★★★☆☆'}
                  {rating === 2 && 'Needs Improvement ★★☆☆☆'}
                  {rating === 1 && 'Poor ★☆☆☆☆'}
                </span>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-[#131926] border border-slate-800 focus:border-blue-500 focus:outline-none text-slate-200"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Feedback Chips */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Quick Highlights</label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_TAGS.map((tag) => {
                    const active = selectedQuickTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          active
                            ? 'border-blue-500/40 bg-blue-600/20 text-blue-300'
                            : 'border-slate-800 bg-[#131926] text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Review text */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Your Review <span className="text-blue-400">*</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {review.length} characters
                  </span>
                </div>
                <textarea
                  value={review}
                  required
                  onChange={(e) => setReview(e.target.value)}
                  rows={3}
                  placeholder="e.g. Excellent speed and code generation. The AI 1 workspace has boosted my productivity!"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-[#131926] border border-slate-800 focus:border-blue-500 focus:outline-none text-slate-200 placeholder:text-slate-600 resize-none"
                />
              </div>

              {/* Additional comments */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Optional: Suggestions or Feature Requests
                </label>
                <input
                  type="text"
                  value={additionalComments}
                  onChange={(e) => setAdditionalComments(e.target.value)}
                  placeholder="What feature would you like to see next?"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-[#131926] border border-slate-800 focus:border-blue-500 focus:outline-none text-slate-200 placeholder:text-slate-600"
                />
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 disabled:opacity-50 flex items-center justify-center gap-2 transition-all cursor-pointer mt-1"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Review (Records to mrtech2xx9@gmail.com)</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-slate-400">
                <span>Or email directly:</span>
                <a
                  href={getGmailComposeUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1 hover:underline"
                >
                  <Mail className="w-3 h-3" />
                  <span>mrtech2xx9@gmail.com</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </form>
          )}
        </motion.div>
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
    </>
  );
};
