
import React from 'react';
import Logo from './Logo';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[999] bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative flex flex-col items-center">
        {/* The Animated Logo */}
        <div className="relative">
          <Logo size={120} animate={true} />
          {/* Fusion Glow Effect */}
          <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-0 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-0 delay-[1.5s]"></div>
        </div>

        {/* Brand Text */}
        <div className="mt-8 overflow-hidden">
          <h1 className="text-3xl font-black text-white tracking-tighter animate-in slide-in-from-bottom-10 duration-1000 delay-500 fill-mode-both">
            Productive<span className="text-brand">Pulse</span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-slate-500 text-xs font-black uppercase tracking-[0.4em] mt-3 animate-in fade-in duration-1000 delay-[1.2s] fill-mode-both">
          Deploying System...
        </p>
      </div>

      {/* Loading Bar at Bottom */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-brand rounded-full animate-[loading_2.5s_ease-in-out_infinite]"></div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); width: 30%; }
          50% { width: 60%; }
          100% { transform: translateX(350%); width: 30%; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
