import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  LockIcon,
  MailIcon,
  RotateCwIcon,
  SendIcon,
  ShieldCheckIcon,
  UserIcon,
  UserPlusIcon,
  XIcon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'sonner';

type AuthView = 'login' | 'register' | 'access-link' | 'verify-email';

export function AuthModal() {
  const { t } = useLanguage();
  const {
    isAuthModalOpen,
    closeAuthModal,
    login,
    register,
    verifyEmail,
    resendCode,
    sendMagicLink
  } = useAuth();

  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for resending OTP code
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    closeAuthModal();
    setTimeout(() => {
      setView('login');
      setError(null);
      setLinkSent(false);
      setOtpCode('');
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    if (view === 'access-link') {
      setSubmitting(true);
      try {
        await sendMagicLink(cleanEmail);
        setLinkSent(true);
        toast.success(`Enlace de acceso enviado a ${cleanEmail}`);
      } catch (err: any) {
        setError(err.message || 'No se pudo enviar el enlace.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!password || password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setSubmitting(true);
    try {
      if (view === 'login') {
        const res = await login(cleanEmail, password);
        if (res.needsVerification) {
          setView('verify-email');
          setResendCooldown(60);
          toast.info('Debes verificar tu correo para activar tu cuenta.');
        } else {
          toast.success('¡Sesión iniciada con éxito!');
          handleClose();
        }
      } else {
        if (!name.trim()) {
          setError('Por favor ingresa tu nombre completo.');
          setSubmitting(false);
          return;
        }
        const res = await register(cleanEmail, password, name.trim());
        if (res.needsVerification) {
          setView('verify-email');
          setResendCooldown(60);
          toast.success(`Código de verificación enviado a ${cleanEmail}`);
        } else {
          toast.success('¡Cuenta creada con éxito! Bienvenido a MapFlex.');
          handleClose();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al procesar la solicitud.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = otpCode.trim();
    if (cleanCode.length !== 6) {
      setError('Por favor ingresa el código numérico de 6 dígitos.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await verifyEmail(email.trim().toLowerCase(), cleanCode);
      toast.success('¡Correo verificado con éxito! Cuenta activada.');
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Código incorrecto o expirado.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await resendCode(email.trim().toLowerCase());
      setResendCooldown(60);
      toast.success('Nuevo código enviado a tu correo.');
    } catch (err: any) {
      setError(err.message || 'No se pudo reenviar el código.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface p-6 shadow-float">
          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar"
            className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-subtle hover:text-ink">
            <XIcon className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-on-ink shadow-sm">
              {view === 'verify-email' ? (
                <ShieldCheckIcon className="h-5 w-5 text-amber-400" />
              ) : (
                <KeyRoundIcon className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">
                {view === 'login'
                  ? 'Iniciar Sesión'
                  : view === 'register'
                  ? 'Crear Cuenta'
                  : view === 'verify-email'
                  ? 'Verifica tu Correo'
                  : 'Link de acceso por correo'}
              </h2>
              <p className="text-xs text-muted">
                {view === 'verify-email'
                  ? `Ingresa el código enviado a ${email}`
                  : view === 'access-link'
                  ? 'Recibe un enlace en tu correo para entrar directamente.'
                  : 'Guarda tus mapas y sincroniza tus proyectos en la nube.'}
              </p>
            </div>
          </div>

          {/* Segmented control tabs (Login / Register) */}
          {view !== 'access-link' && view !== 'verify-email' && (
            <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl border border-line bg-subtle p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setView('login');
                  setError(null);
                }}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${
                  view === 'login'
                    ? 'bg-surface text-ink shadow-2xs font-bold'
                    : 'text-muted hover:text-ink'
                }`}>
                <LockIcon className="h-3.5 w-3.5" />
                <span>Iniciar Sesión</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setView('register');
                  setError(null);
                }}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${
                  view === 'register'
                    ? 'bg-surface text-ink shadow-2xs font-bold'
                    : 'text-muted hover:text-ink'
                }`}>
                <UserPlusIcon className="h-3.5 w-3.5" />
                <span>Crear Cuenta</span>
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 rounded-xl border border-danger/20 bg-danger/10 px-3 py-2 text-xs font-medium text-danger">
              {error}
            </div>
          )}

          {/* OTP EMAIL VERIFICATION VIEW */}
          {view === 'verify-email' ? (
            <form onSubmit={handleVerifyOtpSubmit} className="mt-5 space-y-4">
              <div className="rounded-xl border border-line bg-subtle/50 p-3.5 text-center">
                <p className="text-xs text-muted leading-relaxed">
                  Para proteger la plataforma de bots y uso malicioso, por favor ingresa el código de 6 dígitos que enviamos a:
                </p>
                <p className="mt-1 font-semibold text-xs text-ink">{email}</p>
              </div>

              <div>
                <label className="block text-center text-xs font-medium text-muted">
                  Código de activación de 6 dígitos
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  autoFocus
                  className="mt-2 h-12 w-full rounded-xl border border-line bg-surface text-center font-mono text-xl tracking-[8px] font-black text-ink placeholder:text-muted/30 focus:border-ink focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || otpCode.trim().length !== 6}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-sm font-semibold text-on-ink shadow-sm transition-all hover:bg-ink/90 active:scale-[0.99] disabled:opacity-50">
                <CheckCircle2Icon className="h-4 w-4" />
                <span>{submitting ? 'Verificando...' : 'Verificar y Activar Cuenta'}</span>
              </button>

              <div className="flex items-center justify-between pt-2 text-xs border-t border-line">
                <button
                  type="button"
                  onClick={() => {
                    setView('register');
                    setError(null);
                  }}
                  className="inline-flex items-center gap-1 text-muted hover:text-ink">
                  <ArrowLeftIcon className="h-3.5 w-3.5" />
                  <span>Cambiar correo</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || submitting}
                  className="inline-flex items-center gap-1 font-medium text-accent hover:underline disabled:opacity-50 disabled:no-underline">
                  <RotateCwIcon className={`h-3.5 w-3.5 ${submitting ? 'animate-spin' : ''}`} />
                  <span>{resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : 'Reenviar código'}</span>
                </button>
              </div>
            </form>
          ) : view === 'access-link' && linkSent ? (
            /* ACCESS LINK SENT STATE */
            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
                <p className="text-sm font-semibold text-ink">¡Enlace enviado!</p>
                <p className="mt-1 text-xs text-muted">
                  Revisa tu bandeja de entrada en <strong className="text-ink">{email}</strong> para acceder a MapFlex.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setView('login');
                  setLinkSent(false);
                  setError(null);
                }}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-ink text-sm font-semibold text-on-ink">
                <span>Volver a Iniciar Sesión</span>
              </button>
            </div>
          ) : (
            /* MAIN LOGIN / REGISTER FORM */
            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              {view === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-muted">Nombre completo</label>
                  <div className="relative mt-1">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('fullNamePlaceholder')}
                      className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-muted/60 focus:border-ink focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-muted">Correo electrónico</label>
                <div className="relative mt-1">
                  <MailIcon className="absolute left-3 top-3 h-4 w-4 text-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-muted/60 focus:border-ink focus:outline-none"
                  />
                </div>
              </div>

              {view !== 'access-link' && (
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-muted">Contraseña</label>
                    {view === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setView('access-link');
                          setError(null);
                        }}
                        className="text-[11px] font-medium text-muted hover:text-ink hover:underline">
                        ¿Olvidaste tu contraseña?
                      </button>
                    )}
                  </div>
                  <div className="relative mt-1">
                    <LockIcon className="absolute left-3 top-3 h-4 w-4 text-muted" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={view === 'register' ? 'Mínimo 6 caracteres' : 'Tu contraseña'}
                      className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-10 text-sm text-ink placeholder:text-muted/60 focus:border-ink focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Ver u ocultar contraseña"
                      className="absolute right-3 top-3 text-muted hover:text-ink">
                      {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-sm font-semibold text-on-ink shadow-sm transition-all hover:bg-ink/90 active:scale-[0.99] disabled:opacity-50">
                {submitting ? (
                  <span>Procesando...</span>
                ) : view === 'login' ? (
                  <>
                    <LockIcon className="h-4 w-4" />
                    <span>Iniciar Sesión</span>
                  </>
                ) : view === 'register' ? (
                  <>
                    <UserPlusIcon className="h-4 w-4" />
                    <span>Crear Cuenta y Recibir Código</span>
                  </>
                ) : (
                  <>
                    <SendIcon className="h-4 w-4" />
                    <span>Enviar link de acceso</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer toggle */}
          {view !== 'verify-email' && (
            <div className="mt-4 border-t border-line pt-3 text-center text-xs text-muted">
              {view === 'login' && (
                <p>
                  ¿No tienes una cuenta aún?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setView('register');
                      setError(null);
                    }}
                    className="font-bold text-ink hover:underline">
                    Crear cuenta gratis
                  </button>
                </p>
              )}

              {view === 'register' && (
                <p>
                  ¿Ya tienes una cuenta registrada?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setView('login');
                      setError(null);
                    }}
                    className="font-bold text-ink hover:underline">
                    Iniciar Sesión
                  </button>
                </p>
              )}

              {view === 'access-link' && !linkSent && (
                <button
                  type="button"
                  onClick={() => {
                    setView('login');
                    setError(null);
                  }}
                  className="inline-flex items-center gap-1 font-medium text-muted hover:text-ink">
                  <ArrowLeftIcon className="h-3.5 w-3.5" />
                  <span>Volver a Iniciar Sesión con contraseña</span>
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
