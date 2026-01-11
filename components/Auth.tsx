
import React, { useState, useEffect, useRef } from 'react';
import { User, Account } from '../types';
import Logo from './Logo';
import { GoogleGenAI } from "@google/genai";

interface AuthProps {
  onLogin: (user: Pick<User, 'name' | 'email'>) => void;
}

type AuthStep = 'identity' | 'audit' | 'otp';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [receivedOtp, setReceivedOtp] = useState<string | null>(null);
  
  // OTP & Audit State
  const [step, setStep] = useState<AuthStep>('identity');
  const [auditLog, setAuditLog] = useState<string[]>([]);
  const [otpValue, setOtpValue] = useState(['', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  useEffect(() => {
    const savedAccounts = localStorage.getItem('pulse_accounts');
    if (savedAccounts) {
      const parsed = JSON.parse(savedAccounts) as Account[];
      setAccounts(parsed.sort((a, b) => b.lastLogin - a.lastLogin));
    }
  }, []);

  const validateGmail = (email: string) => {
    return email.toLowerCase().endsWith('@gmail.com');
  };

  const handleQuickLoad = (acc: Account) => {
    setName(acc.name);
    setEmail(acc.email);
    // Automatically trigger audit for existing accounts
    setTimeout(() => startSecurityAudit(), 100);
  };

  const startSecurityAudit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    
    if (!name || !email) { setError('Identify yourself to continue.'); return; }
    if (!validateGmail(email)) { 
      setError('Pulse Sync requires a valid @gmail.com address.'); 
      return; 
    }

    setStep('audit');
    setIsProcessing(true);
    setAuditLog(['Initializing secure tunnel...', 'Establishing Gmail handoff...']);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `The user ${name} is logging in with ${email}. 
        Simulate a brief 10-word technical security confirmation that this Gmail is being linked to ProductivePulse.`,
      });

      const auditResult = response.text || "Gmail Identity Verified. Secure Link Established.";
      setAuditLog(prev => [...prev, 'Cloud Handshake: Success.', auditResult]);

      // Generate random 4-digit OTP
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(code);

      // Simulate network delay for "sending email"
      setTimeout(() => {
        setAuditLog(prev => [...prev, `Encrypted OTP packet sent to ${email.substring(0, 3)}***@gmail.com`, 'Awaiting user confirmation...']);
        setTimeout(() => {
          setStep('otp');
          setIsProcessing(false);
          // Show simulated notification instead of alert
          setReceivedOtp(code);
        }, 1200);
      }, 1000);

    } catch (err) {
      console.error("Audit Failure:", err);
      // Fallback if Gemini or API fails
      setAuditLog(prev => [...prev, 'Cloud audit bypassed. Using local secure protocol.']);
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(code);
      setTimeout(() => {
        setStep('otp');
        setIsProcessing(false);
        setReceivedOtp(code);
      }, 1500);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otpValue];
    newOtp[index] = value.substring(value.length - 1);
    setOtpValue(newOtp);

    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValue[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const verifyCode = () => {
    const entered = otpValue.join('');
    if (entered === generatedOtp) {
      onLogin({ name, email });
    } else {
      setError('Verification mismatch. Security protocol rejected code.');
      setOtpValue(['', '', '', '']);
      otpRefs[0].current?.focus();
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-slate-950 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Simulated Email Notification Toast */}
      {receivedOtp && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 animate-in slide-in-from-top-12 duration-500">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-5 rounded-3xl shadow-2xl flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
              ✉️
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">New Gmail Received</p>
              <p className="text-sm font-bold text-white">Your Pulse Code: <span className="text-emerald-400 tracking-widest">{receivedOtp}</span></p>
            </div>
            <button onClick={() => setReceivedOtp(null)} className="text-white/40 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2}/></svg>
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-10 shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand via-purple-500 to-emerald-500"></div>

          <div className="text-center mb-10">
            <Logo size={64} className="mx-auto mb-6" />
            <h1 className="text-3xl font-black text-white tracking-tighter">
              {step === 'identity' ? 'ProductivePulse' : step === 'audit' ? 'Security Audit' : 'Verify Gmail'}
            </h1>
            <p className="text-slate-500 text-sm mt-2 font-medium">
              {step === 'identity' ? 'Authorized Access Only' : step === 'audit' ? 'Verifying Gmail Identity' : `Verifying access for ${email}`}
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-[11px] font-black uppercase tracking-wider flex items-center gap-3 animate-shake">
              <span className="text-base">🚫</span>
              {error}
            </div>
          )}

          {step === 'identity' && (
            <form onSubmit={startSecurityAudit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity Tag</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/50 text-white placeholder:text-slate-700 font-bold transition-all"
                  placeholder="Your Name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Gmail Account</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/50 text-white placeholder:text-slate-700 font-bold transition-all"
                  placeholder="username@gmail.com"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-brand hover:bg-brand/90 text-white py-5 rounded-[2rem] font-black text-lg transition-all active:scale-95 shadow-xl shadow-brand/20"
              >
                Request Pulse Access
              </button>
            </form>
          )}

          {step === 'audit' && (
            <div className="space-y-6 py-4 animate-in fade-in zoom-in-95 duration-500">
               <div className="flex justify-center mb-8">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-brand/20 border-t-brand rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-brand">✨</div>
                  </div>
               </div>
               <div className="bg-black/30 rounded-2xl p-4 font-mono text-[10px] text-emerald-500 space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                  {auditLog.map((log, i) => (
                    <div key={i} className="flex gap-2">
                       <span className="text-emerald-900">[{i+1}]</span>
                       <span className="break-words">{log}</span>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
              <div className="flex justify-between gap-3">
                {otpValue.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={otpRefs[idx]}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-full aspect-square text-center text-4xl font-black bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-brand/50 transition-all"
                  />
                ))}
              </div>

              <div className="space-y-4">
                <button 
                  onClick={verifyCode}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-[2rem] font-black text-lg transition-all active:scale-95 shadow-xl shadow-emerald-500/20"
                >
                  Confirm Identity
                </button>
                <button 
                  onClick={() => { setStep('identity'); setReceivedOtp(null); setOtpValue(['','','','']); }}
                  className="w-full text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  Change Email Address
                </button>
              </div>
            </div>
          )}
        </div>

        {step === 'identity' && accounts.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-4">
            {accounts.slice(0, 2).map((acc) => (
              <button
                key={acc.email}
                onClick={() => handleQuickLoad(acc)}
                className="p-4 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all text-left flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand/20 flex items-center justify-center text-brand group-hover:scale-110 transition-transform">
                  {acc.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{acc.name}</p>
                  <p className="text-[9px] font-black text-slate-600 uppercase">Load Session</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
