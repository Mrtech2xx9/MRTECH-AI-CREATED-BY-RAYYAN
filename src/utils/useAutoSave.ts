import { useState, useEffect, useRef, useCallback } from 'react';

export interface AutoSavePayload {
  conversations?: any[];
  projects?: any[];
  activeConvId?: string;
  activeProjectId?: string;
  customInstructions?: any;
  memories?: any[];
}

export interface UseAutoSaveOptions {
  intervalMs?: number; // default: 30000 (30 seconds)
  getData: () => AutoSavePayload;
  onSave?: (timestamp: Date) => void;
}

export function useAutoSave({
  intervalMs = 30000,
  getData,
  onSave,
}: UseAutoSaveOptions) {
  const [lastSaved, setLastSaved] = useState<Date | null>(() => {
    const savedTime = localStorage.getItem('mrtech_last_autosave');
    return savedTime ? new Date(savedTime) : null;
  });
  const [isSaving, setIsSaving] = useState(false);

  const getDataRef = useRef(getData);
  getDataRef.current = getData;

  const performSave = useCallback(() => {
    try {
      setIsSaving(true);
      const data = getDataRef.current();

      // Safely persist each slice
      if (data.conversations && Array.isArray(data.conversations)) {
        localStorage.setItem('mrtech_conversations', JSON.stringify(data.conversations));
      }
      if (data.projects && Array.isArray(data.projects)) {
        localStorage.setItem('mrtech_projects', JSON.stringify(data.projects));
      }
      if (data.activeConvId) {
        localStorage.setItem('mrtech_active_conv_id', data.activeConvId);
      }
      if (data.activeProjectId) {
        localStorage.setItem('mrtech_active_project_id', data.activeProjectId);
      }
      if (data.customInstructions) {
        localStorage.setItem('mrtech_instructions', JSON.stringify(data.customInstructions));
      }
      if (data.memories) {
        localStorage.setItem('mrtech_memories', JSON.stringify(data.memories));
      }

      const now = new Date();
      localStorage.setItem('mrtech_last_autosave', now.toISOString());
      setLastSaved(now);
      onSave?.(now);

      // Keep visual saving pulse for 1s
      setTimeout(() => {
        setIsSaving(false);
      }, 1000);
    } catch (err) {
      console.warn('[AutoSave] Warning during localStorage auto-save:', err);
      setIsSaving(false);
    }
  }, [onSave]);

  // Periodic 30-second interval
  useEffect(() => {
    const intervalTimer = setInterval(() => {
      performSave();
    }, intervalMs);

    return () => clearInterval(intervalTimer);
  }, [intervalMs, performSave]);

  // Save immediately on tab close or navigation away
  useEffect(() => {
    const handleBeforeUnload = () => {
      performSave();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        performSave();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [performSave]);

  return {
    lastSaved,
    isSaving,
    performSave,
  };
}
