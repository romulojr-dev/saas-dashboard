'use client';

import { useTheme } from 'next-themes';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { SolarSwitch } from '@/components/ui/solar-switch';
import { useMounted } from '@/hooks/use-mounted';
import { startThemeTransition } from '@/lib/theme-transition';

export function ThemeModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();

  const handleThemeToggle = React.useCallback(
    (e?: React.MouseEvent) => {
      const newMode = resolvedTheme === 'dark' ? 'light' : 'dark';
      startThemeTransition(() => setTheme(newMode), e);
    },
    [resolvedTheme, setTheme]
  );

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleThemeToggle}
    >
      <SolarSwitch isDark={mounted && resolvedTheme === 'dark'} />
    </Button>
  );
}