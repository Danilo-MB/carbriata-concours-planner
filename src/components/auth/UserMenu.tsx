import React, { useState, useRef, useEffect } from 'react';
import { LogInIcon, LogOutIcon, ShieldCheckIcon, UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function UserMenu() {
  const { user, isAuthenticated, isAdmin, openAuthModal, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <button
        type="button"
        onClick={openAuthModal}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-xs font-semibold text-ink shadow-2xs transition-colors hover:bg-subtle active:scale-95">
        <LogInIcon className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
        <span>Iniciar Sesión</span>
      </button>
    );
  }

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-line bg-surface p-1 pr-2.5 text-xs font-semibold text-ink shadow-2xs transition-colors hover:bg-subtle">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-ink text-[11px] font-bold text-on-ink shadow-2xs">
          {initial}
        </span>
        <span className="max-w-[120px] truncate">{user.name}</span>
        {isAdmin && (
          <span className="rounded bg-amber-500/10 border border-amber-500/30 px-1 py-0.2 text-[9px] font-black uppercase text-amber-600 dark:text-amber-400">
            Admin
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-52 overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-float z-50">
          <div className="border-b border-line px-2.5 py-2">
            <div className="flex items-center justify-between gap-1">
              <p className="truncate text-xs font-bold text-ink">{user.name}</p>
              {isAdmin && (
                <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-600 dark:text-amber-400">
                  <ShieldCheckIcon className="h-2.5 w-2.5" />
                  Admin
                </span>
              )}
            </div>
            <p className="truncate text-[11px] text-muted">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              setOpen(false);
            }}
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/10">
            <LogOutIcon className="h-3.5 w-3.5" />
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
}
