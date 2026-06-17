import React from 'react';
import { useUserPrefs, BACKGROUND_PRESETS } from '@/hooks/useUserPrefs';

const UserBackground: React.FC = () => {
  const { prefs } = useUserPrefs();
  const preset = BACKGROUND_PRESETS.find(b => b.id === prefs.background) ?? BACKGROUND_PRESETS[0];
  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none"
      style={{ background: preset.css || 'hsl(var(--background))', zIndex: 0 }}
    />
  );
};

export default UserBackground;

