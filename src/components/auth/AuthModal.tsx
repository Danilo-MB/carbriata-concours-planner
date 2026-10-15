import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  CopyIcon,
  ExternalLinkIcon,
  KeyRoundIcon,
  LockIcon,
  MailIcon,
  SendIcon,
  UserPlusIcon,
  XIcon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

type AuthStep = 'initial' | 'link-sent' | 'google-chooser' | 'apple-chooser' | 'password-login' | 'password-register';

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    login,
    register,
    loginWithGoogle,
    loginWithApple,
    sendMagicLink,
    verifyMagicCode,
    verifyMagicToken
  } = useAuth();

  const [step, setStep] = useState<AuthStep>('initial');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [devLink, setDevLink] = useState<string | null>(null);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customAppleEmail, setCustomAppleEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    closeAuthModal();
    setTimeout(() => {
      setStep('initial');
      setError(null);
      setAccessCode('');
      setDevLink(null);
    }, 200);
  };

  // Google Sign-In with inherited session
  const handleGoogleClick = () => {
    setError(null);
    // Check if GIS is configured with client ID
    const googleObj = (window as any).google;
    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;

    if (googleObj?.accounts?.id && clientId) {
      googleObj.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          try {
            setSubmitting(true);
            await loginWithGoogle({ credential: response.credential });
            toast.success('¡Sesión iniciada con Google!');
            handleClose();
          } catch (err: any) {
            setError(err.message || 'Error con Google');
          } finally {
            setSubmitting(false);
          }
        }
      });
      googleObj.accounts.id.prompt();
    } else {
      // Open Google Account Chooser
      setStep('google-chooser');
    }
  };

  const handleSelectGoogleAccount = async (selectedEmail: string, selectedName: string) => {
    setError(null);
    setSubmitting(true);
    try {
      await loginWithGoogle({
        email: selectedEmail,
        name: selectedName
      });
      toast.success(`¡Sesión iniciada con Google (${selectedEmail})!`);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión con Google.');
    } finally {
      setSubmitting(false);
    }
  };

  // Apple Sign-In
  const handleAppleClick = () => {
    setError(null);
    setStep('apple-chooser');
  };

  const handleSelectAppleAccount = async (selectedEmail: string, selectedName: string) => {
    setError(null);
    setSubmitting(true);
    try {
      await loginWithApple({
        email: selectedEmail,
        name: selectedName
      });
      toast.success(`¡Sesión iniciada con Apple (${selectedEmail})!`);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión con Apple.');
    } finally {
      setSubmitting(false);
    }
  };

  // Send Link de acceso
  const handleSendAccessLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Por favor ingresa un correo electrónico válido.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await sendMagicLink(email);
      setDevLink(res.devLink || null);
      setAccessCode(''); // Leave code blank for real user experience
      setStep('link-sent');
      toast.success('¡Link de acceso generado!');
    } catch (err: any) {
      setError(err.message || 'No se pudo generar el enlace de acceso.');
    } finally {
      setSubmitting(false);
    }
  };

  // Verify access code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode || accessCode.trim().length < 6) {
      setError('Ingresa el código numérico de 6 dígitos.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await verifyMagicCode(email, accessCode.trim());
      toast.success('¡Acceso concedido!');
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Código incorrecto o expirado.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open / Copy Access Link
  const handleOpenAccessLink = async () => {
    if (!devLink) return;
    try {
      const url = new URL(devLink);
      const token = url.searchParams.get('access_token') || url.searchParams.get('magic_token');
      if (token) {
        setSubmitting(true);
        await verifyMagicToken(token);
        toast.success('¡Acceso concedido con tu link!');
        handleClose();
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar el link.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (!devLink) return;
    navigator.clipboard.writeText(devLink);
    toast.success('Link de acceso copiado al portapapeles');
  };

  // Password Submit
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (step === 'password-login') {
        await login(email, password);
        toast.success('¡Bienvenido!');
      } else {
        await register(email, password, name);
        toast.success('¡Cuenta creada con éxito!');
      }
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error');
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
            className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-subtle hover:text-ink">
            <XIcon className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-on-ink shadow-sm">
              <KeyRoundIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">
                {step === 'link-sent'
                  ? 'Revisa tu correo'
                  : step === 'google-chooser'
                  ? 'Acceder con Google'
                  : step === 'apple-chooser'
                  ? 'Continuar con Apple'
                  : step === 'password-register'
                  ? 'Crear Cuenta'
                  : 'Iniciar Sesión'}
              </h2>
              <p className="text-xs text-muted">
                {step === 'link-sent'
                  ? `Enviamos el enlace de acceso a ${email}`
                  : 'Guarda tus mapas y sincroniza en la nube.'}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-xs font-medium text-danger">
              {error}
            </div>
          )}

          {/* STEP 1: Main Auth Options */}
          {step === 'initial' && (
            <div className="mt-5 space-y-4">
              {/* Social Login Buttons */}
              <div className="space-y-2.5">
                {/* Google Button */}
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={submitting}
                  className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-ink shadow-2xs transition-all hover:bg-subtle hover:border-ink/20 active:scale-[0.99] disabled:opacity-50">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.43 7.35 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.57 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                    />
                  </svg>
                  <span>Continuar con Google</span>
                </button>

                {/* Apple Button */}
                <button
                  type="button"
                  onClick={handleAppleClick}
                  disabled={submitting}
                  className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-ink shadow-2xs transition-all hover:bg-subtle hover:border-ink/20 active:scale-[0.99] disabled:opacity-50">
                  <svg className="h-4 w-4 fill-current text-ink" viewBox="0 0 170 170" aria-hidden="true">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.66-7.85-11.88-14.42-6.53-10.12-11.33-21.49-14.4-34.1-3.08-12.62-4.62-24.47-4.62-35.56 0-14.26 3.6-26.04 10.8-35.33 7.2-9.3 16.27-14.07 27.21-14.33 4.8 0 10.3 1.28 16.51 3.86 6.2 2.58 10.02 3.88 11.44 3.88 1.22 0 5.14-1.34 11.77-4.03 6.63-2.69 12.16-3.88 16.59-3.56 12.82.64 22.8 5.25 29.93 13.82-11.16 6.77-16.63 16.14-16.42 28.11.21 9.4 3.93 17.2 11.17 23.39 7.23 6.2 15.64 9.68 25.21 10.45-2.01 6.13-4.47 12.36-7.38 18.68zM119.22 33.15c0-7.29 2.65-14.28 7.96-20.97 5.3-6.68 11.96-11.08 19.98-13.18.21 1.06.32 2.06.32 3.01 0 7.39-2.8 14.53-8.4 21.43-5.61 6.9-12.43 11.08-20.46 12.54-.32-.95-.49-1.92-.49-2.83z" />
                  </svg>
                  <span>Continuar con Apple</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-line" />
                <span className="absolute bg-surface px-3 text-[11px] font-semibold text-muted uppercase tracking-wider">
                  O con link de acceso
                </span>
              </div>

              {/* Access Link Form */}
              <form onSubmit={handleSendAccessLink} className="space-y-3">
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
                      className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-muted">
                    Te enviaremos un link de acceso para entrar directamente sin contraseña.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-ink text-sm font-semibold text-on-ink transition-colors hover:bg-ink/90 disabled:opacity-50 active:scale-[0.99]">
                  <SendIcon className="h-4 w-4" />
                  <span>{submitting ? 'Enviando link...' : 'Enviar link de acceso'}</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </form>

              {/* Toggle to password login */}
              <div className="pt-2 text-center border-t border-line">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep('password-login');
                  }}
                  className="text-xs font-medium text-muted hover:text-ink transition-colors">
                  ¿Prefieres ingresar con contraseña? <span className="underline">Haz clic aquí</span>
                </button>
              </div>
            </div>
          )}

          {/* GOOGLE ACCOUNT CHOOSER */}
          {step === 'google-chooser' && (
            <div className="mt-5 space-y-4">
              <p className="text-xs text-muted">
                Selecciona la cuenta de Google con la que deseas iniciar sesión en MapFlex:
              </p>

              {/* Primary Active Google Account */}
              <button
                type="button"
                onClick={() => handleSelectGoogleAccount('dmarinobata@gmail.com', 'Danilo Marino')}
                disabled={submitting}
                className="flex w-full items-center gap-3 rounded-xl border border-line bg-subtle/50 p-3 text-left transition-all hover:border-ink/40 hover:bg-subtle active:scale-[0.99]">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-2xs">
                  D
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-semibold text-ink">Danilo Marino</span>
                    <span className="rounded bg-amber-500/10 border border-amber-500/30 px-1 py-0.2 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                      Admin
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted">dmarinobata@gmail.com</p>
                </div>
                <CheckCircle2Icon className="h-4 w-4 text-emerald-500 shrink-0" />
              </button>

              {/* Option to use another Google account */}
              <div className="rounded-xl border border-line p-3">
                <label className="block text-xs font-medium text-muted">O usar otra cuenta de Google:</label>
                <div className="mt-1.5 flex gap-2">
                  <input
                    type="email"
                    placeholder="otro@gmail.com"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    className="h-9 flex-1 rounded-lg border border-line bg-surface px-2.5 text-xs text-ink placeholder:text-muted focus:border-ink focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={!customGoogleEmail.includes('@') || submitting}
                    onClick={() => handleSelectGoogleAccount(customGoogleEmail, customGoogleEmail.split('@')[0])}
                    className="inline-flex h-9 items-center rounded-lg bg-ink px-3 text-xs font-semibold text-on-ink disabled:opacity-50">
                    Entrar
                  </button>
                </div>
              </div>

              <div className="pt-2 text-center border-t border-line">
                <button
                  type="button"
                  onClick={() => setStep('initial')}
                  className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-ink">
                  <ArrowLeftIcon className="h-3.5 w-3.5" />
                  <span>Volver a opciones de inicio</span>
                </button>
              </div>
            </div>
          )}

          {/* APPLE ACCOUNT CHOOSER */}
          {step === 'apple-chooser' && (
            <div className="mt-5 space-y-4">
              <p className="text-xs text-muted">
                Selecciona la cuenta de Apple con la que deseas iniciar sesión en MapFlex:
              </p>

              {/* Primary Active Apple Account */}
              <button
                type="button"
                onClick={() => handleSelectAppleAccount('dmarinobata@gmail.com', 'Danilo Marino')}
                disabled={submitting}
                className="flex w-full items-center gap-3 rounded-xl border border-line bg-subtle/50 p-3 text-left transition-all hover:border-ink/40 hover:bg-subtle active:scale-[0.99]">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-on-ink shadow-2xs">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.66-7.85-11.88-14.42-6.53-10.12-11.33-21.49-14.4-34.1-3.08-12.62-4.62-24.47-4.62-35.56 0-14.26 3.6-26.04 10.8-35.33 7.2-9.3 16.27-14.07 27.21-14.33 4.8 0 10.3 1.28 16.51 3.86 6.2 2.58 10.02 3.88 11.44 3.88 1.22 0 5.14-1.34 11.77-4.03 6.63-2.69 12.16-3.88 16.59-3.56 12.82.64 22.8 5.25 29.93 13.82-11.16 6.77-16.63 16.14-16.42 28.11.21 9.4 3.93 17.2 11.17 23.39 7.23 6.2 15.64 9.68 25.21 10.45-2.01 6.13-4.47 12.36-7.38 18.68zM119.22 33.15c0-7.29 2.65-14.28 7.96-20.97 5.3-6.68 11.96-11.08 19.98-13.18.21 1.06.32 2.06.32 3.01 0 7.39-2.8 14.53-8.4 21.43-5.61 6.9-12.43 11.08-20.46 12.54-.32-.95-.49-1.92-.49-2.83z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-semibold text-ink">Danilo Marino</span>
                    <span className="rounded bg-amber-500/10 border border-amber-500/30 px-1 py-0.2 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                      Admin
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted">dmarinobata@gmail.com</p>
                </div>
                <CheckCircle2Icon className="h-4 w-4 text-emerald-500 shrink-0" />
              </button>

              {/* Option to use another Apple account */}
              <div className="rounded-xl border border-line p-3">
                <label className="block text-xs font-medium text-muted">O usar otro Apple ID / correo:</label>
                <div className="mt-1.5 flex gap-2">
                  <input
                    type="email"
                    placeholder="usuario@icloud.com"
                    value={customAppleEmail}
                    onChange={(e) => setCustomAppleEmail(e.target.value)}
                    className="h-9 flex-1 rounded-lg border border-line bg-surface px-2.5 text-xs text-ink placeholder:text-muted focus:border-ink focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={!customAppleEmail.includes('@') || submitting}
                    onClick={() => handleSelectAppleAccount(customAppleEmail, customAppleEmail.split('@')[0])}
                    className="inline-flex h-9 items-center rounded-lg bg-ink px-3 text-xs font-semibold text-on-ink disabled:opacity-50">
                    Entrar
                  </button>
                </div>
              </div>

              <div className="pt-2 text-center border-t border-line">
                <button
                  type="button"
                  onClick={() => setStep('initial')}
                  className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-ink">
                  <ArrowLeftIcon className="h-3.5 w-3.5" />
                  <span>Volver a opciones de inicio</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: LINK ENVIADO */}
          {step === 'link-sent' && (
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-center">
                <CheckCircle2Icon className="mx-auto h-8 w-8 text-emerald-500" />
                <h3 className="mt-2 text-base font-semibold text-ink">¡Link de acceso generado!</h3>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  Haz clic en el enlace para ingresar directamente a MapFlex con tu cuenta <strong className="text-ink">{email}</strong>.
                </p>
              </div>

              {/* Direct click action to simulate clicking the email link */}
              {devLink && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleOpenAccessLink}
                    disabled={submitting}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-sm font-semibold text-on-ink shadow-sm transition-colors hover:bg-ink/90 active:scale-[0.99] disabled:opacity-50">
                    <ExternalLinkIcon className="h-4 w-4" />
                    <span>{submitting ? 'Ingresando...' : 'Hacer clic e ingresar directamente'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-line bg-surface text-xs font-semibold text-ink shadow-2xs hover:bg-subtle active:scale-[0.99]">
                    <CopyIcon className="h-3.5 w-3.5 text-muted" />
                    <span>Copiar link de acceso</span>
                  </button>
                </div>
              )}

              {/* Optional code input if user prefers entering 6 digits */}
              <div className="border-t border-line pt-3">
                <form onSubmit={handleVerifyCode} className="space-y-2.5">
                  <label className="block text-center text-xs font-medium text-muted">
                    O si recibiste un código de 6 dígitos, ingrésalo aquí:
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="Código de 6 dígitos"
                    className="h-10 w-full rounded-xl border border-line bg-surface text-center font-mono text-base tracking-[4px] font-bold text-ink placeholder:text-muted/40 focus:border-ink focus:outline-none"
                  />
                  {accessCode.length === 6 && (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex h-9 w-full items-center justify-center rounded-lg bg-ink text-xs font-semibold text-on-ink">
                      Verificar código
                    </button>
                  )}
                </form>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep('initial');
                  }}
                  className="inline-flex items-center gap-1 text-muted hover:text-ink">
                  <ArrowLeftIcon className="h-3.5 w-3.5" />
                  <span>Cambiar correo</span>
                </button>
                <button
                  type="button"
                  onClick={handleSendAccessLink}
                  disabled={submitting}
                  className="font-medium text-accent hover:underline">
                  Reenviar link
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 & 4: Traditional Password Login / Register */}
          {(step === 'password-login' || step === 'password-register') && (
            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-1 rounded-lg border border-line bg-subtle p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setStep('password-login');
                    setError(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 transition-colors ${
                    step === 'password-login' ? 'bg-surface text-ink shadow-2xs' : 'text-muted hover:text-ink'
                  }`}>
                  <LockIcon className="h-3.5 w-3.5" />
                  Ingresar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep('password-register');
                    setError(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 transition-colors ${
                    step === 'password-register' ? 'bg-surface text-ink shadow-2xs' : 'text-muted hover:text-ink'
                  }`}>
                  <UserPlusIcon className="h-3.5 w-3.5" />
                  Registrarse
                </button>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                {step === 'password-register' && (
                  <div>
                    <label className="block text-xs font-medium text-muted">Nombre completo</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="ej. Danilo Marino"
                      className="mt-1 h-10 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
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
                    className="mt-1 h-10 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
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
                    className="mt-1 h-10 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-ink text-sm font-semibold text-on-ink transition-colors hover:bg-ink/90 disabled:opacity-50">
                  {submitting
                    ? 'Procesando...'
                    : step === 'password-login'
                    ? 'Iniciar Sesión'
                    : 'Crear Cuenta'}
                </button>
              </form>

              <div className="pt-2 text-center border-t border-line">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep('initial');
                  }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-ink">
                  <ArrowLeftIcon className="h-3.5 w-3.5" />
                  <span>Volver a Google, Apple y Link de acceso</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
