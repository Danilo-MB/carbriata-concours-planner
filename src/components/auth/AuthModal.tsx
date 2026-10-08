import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { KeyRoundIcon, LogInIcon, SparklesIcon, UserPlusIcon, XIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@carbriata.com');
    setPassword('carbriata2027');
    setError(null);
    setSubmitting(true);
    try {
      await login('demo@carbriata.com', 'carbriata2027');
    } catch (err: any) {
      setError(err.message || 'Error con cuenta demo');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface p-6 shadow-float">
          {/* Close button */}
          <button
            type="button"
            onClick={closeAuthModal}
            className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-subtle hover:text-ink">
            <XIcon className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-on-ink shadow-sm">
              <KeyRoundIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">
                {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </h2>
              <p className="text-xs text-muted">
                {mode === 'login'
                  ? 'Guarda y sincroniza tus planos y elementos en la nube.'
                  : 'Empieza a trazar y colaborar en tus proyectos.'}
              </p>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="mt-5 grid grid-cols-2 gap-1 rounded-lg border border-line bg-subtle p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 transition-colors ${
                mode === 'login' ? 'bg-surface text-ink shadow-2xs' : 'text-muted hover:text-ink'
              }`}>
              <LogInIcon className="h-3.5 w-3.5" />
              Ingresar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 transition-colors ${
                mode === 'register' ? 'bg-surface text-ink shadow-2xs' : 'text-muted hover:text-ink'
              }`}>
              <UserPlusIcon className="h-3.5 w-3.5" />
              Registrarse
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-3 rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-xs font-medium text-danger">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-muted">Nombre completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ej. Danilo Marino"
                  className="mt-1 h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-muted">Correo electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="mt-1 h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted">Contraseña</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="mt-1 h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-ink text-sm font-semibold text-on-ink transition-colors hover:bg-ink/90 disabled:opacity-50">
              {submitting ? 'Procesando...' : mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </button>
          </form>

          {/* Demo account quick button */}
          <div className="mt-4 border-t border-line pt-3">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={submitting}
              className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-amber-500/50 bg-amber-500/5 text-xs font-semibold text-amber-600 transition-colors hover:bg-amber-500/10 dark:text-amber-400">
              <SparklesIcon className="h-3.5 w-3.5" />
              Probar con cuenta Demo (Danilo Carbriata)
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
