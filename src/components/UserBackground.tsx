import React from 'react';
import { useUserPrefs, BACKGROUND_PRESETS } from '@/hooks/useUserPrefs';

const UserBackground: React.FC = () => {
  const { prefs } = useUserPrefs();
  const preset = BACKGROUND_PRESETS.find(b => b.id === prefs.background) ?? BACKGROUND_PRESETS[0];
  if (!preset.css) return null;
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ background: preset.css }}
    />
  );
};

export default UserBackground;
