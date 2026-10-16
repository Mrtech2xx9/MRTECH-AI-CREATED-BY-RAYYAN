import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, CustomInstructions } from '../types';
import { MrTechLogo } from './MrTechLogo';
import { Sparkles, ArrowRight, Check, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profileData: Partial<UserProfile>, instructions: Partial<CustomInstructions>) => void;
}

const OCCUPATION_OPTIONS = [
  'Developer',
  'Student',
  'Working Professional',
  'Business / Founder',
  'Creator',
  'Learning / Enthusiast',
  'Other',
];

const GOALS_OPTIONS = [
  'Coding & Debugging',
  'Study & Learning',
  'Research & Analysis',
  'Content Creation',
  'Writing & Emails',
  'Business Strategy',
  'AI Image Studio',
  'General Assistance',
];

const STYLE_OPTIONS: Array<{ label: CustomInstructions['responseStyle']; desc: string }> = [
  { label: 'Technical', desc: 'Precise code, architectural depth & security best-practices' },
  { label: 'Professional', desc: 'Structured, polished, concise and direct' },
  { label: 'Detailed', desc: 'Thorough explanations, comprehensive breakdown' },
  { label: 'Simple', desc: 'Jargon-free, easy to understand' },
  { label: 'Short', desc: 'Bullet points, compact answers' },
  { label: 'Friendly', desc: 'Warm, conversational, and encouraging' },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(1);
  const [occupation, setOccupation] = useState<string>('Developer');
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['Coding & Debugging', 'AI Image Studio']);
  const [responseStyle, setResponseStyle] = useState<CustomInstructions['responseStyle']>('Technical');
  const [educationLevel, setEducationLevel] = useState<string>('');

  if (!isOpen) return null;

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleFinish = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#14b8a6', '#3b82f6'],
      });
    } catch (e) {}

    const aboutUser = `User Role: ${occupation}${educationLevel ? `, Education Level: ${educationLevel}` : ''}. Primary Goals: ${selectedGoals.join(', ')}.`;
    const howToRespond = `Prioritize ${responseStyle.toLowerCase()} tone. Tailor all assistance to ${occupation} level workflow.`;

    onComplete(
      {
        occupation,
        goals: selectedGoals,
        responseStyle,
        educationLevel,
        onboarded: true,
      },
      {
        aboutUser,
        howToRespond,
        responseStyle,
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl my-8 bg-slate-900/95 border border-cyan-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/50 text-slate-100 flex flex-col gap-6"
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <MrTechLogo size="lg" showSubtitle={true} showCreator={true} />
          <div className="flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Personalize Your MR TECH AI Experience</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mt-1">
            Configure how MR TECH AI powers your daily workflow with the AI 1 Engine.
          </p>

          {/* Progress bar */}
          <div className="w-full grid grid-cols-3 gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s <= step ? 'bg-gradient-to-r from-cyan-500 to-teal-400' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Occupation */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-4"
          >
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs font-mono">1</span>
                What are you currently doing?
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Select your primary role or activity.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {OCCUPATION_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setOccupation(opt)}
                  className={`p-3 rounded-xl text-left text-xs sm:text-sm font-medium border transition-all duration-200 ${
                    occupation === opt
                      ? 'border-cyan-400 bg-cyan-500/15 text-cyan-200 shadow-md shadow-cyan-950/40'
                      : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{opt}</span>
                    {occupation === opt && <Check className="w-4 h-4 text-cyan-400" />}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-2">
              <label className="text-xs text-slate-400 block mb-1">
                Optional: Education Level / Current Class
              </label>
              <input
                type="text"
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                placeholder="e.g. Computer Science Undergrad, High School, Self-taught"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-950/70 border border-slate-800 focus:border-cyan-500 focus:outline-none text-slate-200 placeholder:text-slate-600"
              />
            </div>
          </motion.div>
        )}

        {/* Step 2: Primary Goals */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-4"
          >
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs font-mono">2</span>
                What do you mainly want MR TECH AI to help with?
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Select one or more capabilities.</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {GOALS_OPTIONS.map((goal) => {
                const active = selectedGoals.includes(goal);
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => toggleGoal(goal)}
                    className={`p-3 rounded-xl text-left text-xs sm:text-sm font-medium border transition-all duration-200 ${
                      active
                        ? 'border-cyan-400 bg-cyan-500/15 text-cyan-200 shadow-md shadow-cyan-950/40'
                        : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{goal}</span>
                      {active && <Check className="w-4 h-4 text-cyan-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Step 3: Response Style */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-4"
          >
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs font-mono">3</span>
                What response style do you prefer?
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">AI 1 will tailor its answers to this style.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {STYLE_OPTIONS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setResponseStyle(item.label)}
                  className={`p-3 rounded-xl text-left border transition-all duration-200 ${
                    responseStyle === item.label
                      ? 'border-cyan-400 bg-cyan-500/15 text-cyan-200 shadow-md shadow-cyan-950/40'
                      : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-sm">
                    <span>{item.label}</span>
                    {responseStyle === item.label && <Check className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{item.desc}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 hover:brightness-110 flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 text-slate-950 hover:brightness-110 flex items-center gap-2 shadow-lg shadow-cyan-400/30"
            >
              <Zap className="w-4 h-4" />
              <span>Launch Workspace</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
