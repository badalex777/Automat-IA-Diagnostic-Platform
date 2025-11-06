import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle2, Mail, Clock, AlertCircle } from "lucide-react";

/**
 * EmailVerificationGate Component
 * 
 * Gating component that requires email verification before allowing access to form content.
 * Manages verification state, countdown timer, and API interactions.
 * 
 * Flow: idle → sending → sent → verified
 */

interface EmailVerificationGateProps {
  formType: 'tfa' | 'pif';
  language: 'en' | 'es';
  translations: {
    title: string;
    description: string;
    emailLabel: string;
    emailPlaceholder: string;
    sendCodeButton: string;
    codeLabel: string;
    codePlaceholder: string;
    verifyButton: string;
    resendButton: string;
    verifiedMessage: string;
    expiresIn: string;
    codeExpired: string;
    sendingCode: string;
    verifyingCode: string;
  };
  onVerified: (email: string) => void;
  children: React.ReactNode;
}

type VerificationState = 'idle' | 'sending' | 'sent' | 'verifying' | 'verified' | 'expired';

export function EmailVerificationGate({
  formType,
  language,
  translations: t,
  onVerified,
  children,
}: EmailVerificationGateProps) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [state, setState] = useState<VerificationState>('idle');
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const { toast } = useToast();

  // Countdown timer
  useEffect(() => {
    if (!expiresAt || state === 'verified') {
      setRemainingSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setRemainingSeconds(remaining);

      if (remaining === 0 && state === 'sent') {
        setState('expired');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, state]);

  // Format countdown display (MM:SS)
  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Send verification code
  const handleSendCode = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        variant: "destructive",
        title: language === 'en' ? "Invalid Email" : "Correo Inválido",
        description: language === 'en' 
          ? "Please enter a valid email address" 
          : "Por favor ingrese una dirección de correo válida",
      });
      return;
    }

    setState('sending');

    try {
      const response = await apiRequest('POST', '/api/send-verification-code', { 
        email, 
        formType, 
        language 
      });

      if (response.ok) {
        setState('sent');
        setExpiresAt(Date.now() + 10 * 60 * 1000); // 10 minutes
        setCode('');
        toast({
          title: language === 'en' ? "Code Sent" : "Código Enviado",
          description: language === 'en'
            ? "Check your email for the 6-digit verification code"
            : "Revisa tu correo para el código de verificación de 6 dígitos",
        });
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send code');
      }
    } catch (error: any) {
      console.error('Error sending code:', error);
      setState('idle');
      toast({
        variant: "destructive",
        title: language === 'en' ? "Error" : "Error",
        description: error.message || (language === 'en' 
          ? "Failed to send verification code. Please try again." 
          : "No se pudo enviar el código de verificación. Por favor intente de nuevo."),
      });
    }
  };

  // Verify code
  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      toast({
        variant: "destructive",
        title: language === 'en' ? "Invalid Code" : "Código Inválido",
        description: language === 'en'
          ? "Please enter the 6-digit verification code"
          : "Por favor ingrese el código de verificación de 6 dígitos",
      });
      return;
    }

    setState('verifying');

    try {
      const response = await apiRequest('POST', '/api/verify-code', { 
        email, 
        code 
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setState('verified');
        onVerified(email);
        toast({
          title: language === 'en' ? "Email Verified" : "Correo Verificado",
          description: language === 'en'
            ? "Your email has been verified successfully"
            : "Tu correo ha sido verificado exitosamente",
        });
      } else {
        setState('sent');
        toast({
          variant: "destructive",
          title: language === 'en' ? "Invalid Code" : "Código Inválido",
          description: data.error || (language === 'en'
            ? "The verification code is incorrect. Please try again."
            : "El código de verificación es incorrecto. Por favor intente de nuevo."),
        });
      }
    } catch (error: any) {
      console.error('Error verifying code:', error);
      setState('sent');
      toast({
        variant: "destructive",
        title: language === 'en' ? "Error" : "Error",
        description: error.message || (language === 'en'
          ? "Failed to verify code. Please try again."
          : "No se pudo verificar el código. Por favor intente de nuevo."),
      });
    }
  };

  // If verified, render children
  if (state === 'verified') {
    return <>{children}</>;
  }

  // Otherwise, render verification gate
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            {t.title}
          </CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="verification-email" data-testid="label-email">
              {t.emailLabel}
            </Label>
            <div className="flex gap-2">
              <Input
                id="verification-email"
                data-testid="input-verification-email"
                type="email"
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={state !== 'idle' && state !== 'expired'}
                className="flex-1"
              />
              <Button
                data-testid="button-send-code"
                onClick={handleSendCode}
                disabled={state === 'sending' || (state === 'sent' && remainingSeconds > 0)}
              >
                {state === 'sending' ? t.sendingCode : state === 'sent' && remainingSeconds > 0 ? t.sendCodeButton : state === 'expired' ? t.resendButton : t.sendCodeButton}
              </Button>
            </div>
          </div>

          {/* Countdown Timer */}
          {state === 'sent' && remainingSeconds > 0 && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription className="flex items-center gap-2">
                {t.expiresIn}: <strong>{formatCountdown(remainingSeconds)}</strong>
              </AlertDescription>
            </Alert>
          )}

          {/* Code Expired */}
          {state === 'expired' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{t.codeExpired}</AlertDescription>
            </Alert>
          )}

          {/* Code Input (shown after code sent) */}
          {(state === 'sent' || state === 'verifying') && (
            <div className="space-y-2">
              <Label htmlFor="verification-code" data-testid="label-code">
                {t.codeLabel}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="verification-code"
                  data-testid="input-verification-code"
                  type="text"
                  placeholder={t.codePlaceholder}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={state === 'verifying'}
                  maxLength={6}
                  className="flex-1 text-center text-2xl tracking-widest font-mono"
                />
                <Button
                  data-testid="button-verify-code"
                  onClick={handleVerifyCode}
                  disabled={state === 'verifying' || code.length !== 6}
                >
                  {state === 'verifying' ? t.verifyingCode : t.verifyButton}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
