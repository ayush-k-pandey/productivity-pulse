
import React, { useState, useMemo } from 'react';
import { User, HistoryData, Note } from '../types';
import { ACTIVITIES } from '../constants';
import Logo from './Logo';
import { 
  BarChart, 
  Bar, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface AdvancedOptionsProps {
  user: User;
  history: HistoryData;
  notes: Note[];
  onUpdateUser: (user: User) => void;
  onRestore: (data: { user: User, history: HistoryData, notes: Note[] }) => void;
}

type TabId = 'appearance' | 'widgets' | 'streaks' | 'security';
type WidgetBlueprint = 'pulse-ring' | 'summary-card' | 'weekly-spark';

const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({ user, history, notes, onUpdateUser, onRestore }) => {
  const [activeTab, setActiveTab] = useState<TabId>('widgets');
  const [widgetSize, setWidgetSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [activeBlueprint, setActiveBlueprint] = useState<WidgetBlueprint>('pulse-ring');
  const [wallpaper, setWallpaper] = useState<'light' | 'dark'>('dark');

  const streakStats = useMemo(() => {
    let current = 0;
    let longest = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const sortedDates = Object.keys(history).sort();

    let tempLongest = 0;
    let lastDate: Date | null = null;
    
    sortedDates.forEach(dStr => {
      const hasProgress = history[dStr] && Object.values(history[dStr]).some(v => v === true);
      if (hasProgress) {
        if (!lastDate) tempLongest = 1;
        else {
          const diff = (new Date(dStr).getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
          if (diff === 1) tempLongest++;
          else tempLongest = 1;
        }
        longest = Math.max(longest, tempLongest);
        lastDate = new Date(dStr);
      }
    });

    let checkDate = new Date();
    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      const hasProgress = history[dStr] && Object.values(history[dStr]).some(v => v === true);
      if (hasProgress) {
        current++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        if (dStr === todayStr) { checkDate.setDate(checkDate.getDate() - 1); continue; }
        break;
      }
    }
    return { current, longest };
  }, [history]);

  const productivityMetrics = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayCompleted = history[today] ? Object.values(history[today]).filter(v => v).length : 0;
    const goalCount = user.selectedActivityIds.length || 1;
    const percentage = Math.round((todayCompleted / goalCount) * 100);
    
    // Heuristic: Each task is roughly 45 minutes of productive time
    const todayMinutes = todayCompleted * 45;
    
    const last7Days = [];
    let totalWeeklyCompleted = 0;
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const count = history[dStr] ? Object.values(history[dStr]).filter(v => v).length : 0;
      totalWeeklyCompleted += count;
      last7Days.push({ 
        day: d.toLocaleDateString('en-US', { weekday: 'short' }), 
        count,
        time: count * 45 
      });
    }

    const weeklyTimeStr = `${Math.floor((totalWeeklyCompleted * 45) / 60)}h ${(totalWeeklyCompleted * 45) % 60}m`;
    const todayTimeStr = `${Math.floor(todayMinutes / 60)}h ${todayMinutes % 60}m`;

    let motivation = "Ready to start?";
    if (percentage === 100) motivation = "Absolute Beast Mode! 🏆";
    else if (percentage >= 75) motivation = "Main Character Energy ✨";
    else if (percentage >= 40) motivation = "Keep the momentum! ⚡";
    else if (percentage > 0) motivation = "The pulse is rising... 📈";

    return { percentage, todayMinutes, todayTimeStr, weeklyTimeStr, last7Days, motivation, todayCompleted, goalCount };
  }, [history, user.selectedActivityIds]);

  // Fix: Added missing requestNotificationPermission function
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications.");
      return;
    }
    
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      onUpdateUser({
        ...user,
        notificationSettings: {
          ...user.notificationSettings,
          enabled: true
        }
      });
    } else {
      alert("Notification access was denied. You can enable them in your browser settings to receive Pulse alerts.");
    }
  };

  const ringData = [
    { name: 'Completed', value: productivityMetrics.percentage },
    { name: 'Remaining', value: 100 - productivityMetrics.percentage }
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[700px] animate-in fade-in slide-in-from-bottom-6 duration-700">
      <aside className="lg:w-64 space-y-2 flex-shrink-0">
        <h2 className="text-xl font-black mb-6 dark:text-white px-2">Control Center</h2>
        <TabButton active={activeTab === 'widgets'} onClick={() => setActiveTab('widgets')} icon="📱" label="Android Simulator" />
        <TabButton active={activeTab === 'streaks'} onClick={() => setActiveTab('streaks')} icon="🔥" label="Streaks Hub" />
        <TabButton active={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')} icon="🎨" label="Visual Theme" />
        <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon="🛡️" label="Access Rules" />
      </aside>

      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-8 shadow-sm">
        {activeTab === 'widgets' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <h3 className="text-2xl font-black tracking-tight dark:text-white mb-2">Android Home Screen</h3>
                <p className="text-slate-500 text-sm font-medium">Customize and prototype your system-level Pulse widgets.</p>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                 <button onClick={() => setActiveBlueprint('pulse-ring')} className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all ${activeBlueprint === 'pulse-ring' ? 'bg-brand text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>Ring</button>
                 <button onClick={() => setActiveBlueprint('summary-card')} className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all ${activeBlueprint === 'summary-card' ? 'bg-brand text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>Stats</button>
                 <button onClick={() => setActiveBlueprint('weekly-spark')} className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all ${activeBlueprint === 'weekly-spark' ? 'bg-brand text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>Weekly</button>
              </div>
            </div>

            {/* Mobile Simulator */}
            <div className={`relative w-full max-w-[500px] aspect-[9/16] mx-auto rounded-[3.5rem] border-[10px] border-slate-900 shadow-[0_0_80px_rgba(0,0,0,0.2)] overflow-hidden transition-all duration-700 ${wallpaper === 'dark' ? 'bg-slate-950' : 'bg-blue-100'}`}>
               {/* Wallpaper Simulation */}
               <div className={`absolute inset-0 transition-opacity duration-1000 ${wallpaper === 'dark' ? 'opacity-100' : 'opacity-0'}`}>
                 <div className="absolute top-1/4 right-0 w-80 h-80 bg-indigo-600/30 blur-[100px] rounded-full"></div>
                 <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-emerald-600/20 blur-[100px] rounded-full"></div>
               </div>
               <div className={`absolute inset-0 transition-opacity duration-1000 ${wallpaper === 'light' ? 'opacity-100' : 'opacity-0'}`}>
                 <div className="absolute top-1/4 left-0 w-80 h-80 bg-orange-200 blur-[100px] rounded-full"></div>
                 <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-blue-300 blur-[100px] rounded-full"></div>
               </div>

               {/* Status Bar */}
               <div className="relative z-10 p-6 flex justify-between items-center text-white/80 font-bold text-[10px]">
                  <span>{new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                  <div className="flex gap-1.5 items-center">
                    <div className="w-3.5 h-3.5 border-2 border-white/40 rounded-sm"></div>
                    <div className="w-4 h-2 bg-white/60 rounded-sm"></div>
                  </div>
               </div>

               {/* Widget Area */}
               <div className="relative z-10 mt-12 px-6 flex flex-col items-center">
                  <div className={`transition-all duration-700 bg-white/10 backdrop-blur-3xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[2.5rem] p-6 group flex flex-col justify-between ${
                    widgetSize === 'small' ? 'w-44 h-44' : 
                    widgetSize === 'medium' ? 'w-full h-44' : 'w-full h-80'
                  }`}>
                    
                    {/* Ring Blueprint */}
                    {activeBlueprint === 'pulse-ring' && (
                      <div className="flex-1 flex flex-col items-center justify-center relative">
                         <div className="w-full h-full flex flex-col items-center justify-center">
                           <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={ringData}
                                  innerRadius="75%"
                                  outerRadius="95%"
                                  paddingAngle={5}
                                  dataKey="value"
                                  startAngle={90}
                                  endAngle={-270}
                                >
                                  <Cell fill="var(--brand-primary)" />
                                  <Cell fill="rgba(255,255,255,0.05)" />
                                </Pie>
                              </PieChart>
                           </ResponsiveContainer>
                           <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                              <p className="text-3xl font-black text-white">{productivityMetrics.percentage}%</p>
                              {widgetSize !== 'small' && <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">Pulse Score</p>}
                           </div>
                         </div>
                      </div>
                    )}

                    {/* Summary Blueprint */}
                    {activeBlueprint === 'summary-card' && (
                      <div className="flex-1 flex flex-col justify-between py-2">
                        <div className="flex justify-between items-start">
                          <Logo size={24} />
                          <div className="text-right">
                             <p className="text-white text-lg font-black">{productivityMetrics.todayTimeStr}</p>
                             <p className="text-[10px] font-black text-white/40 uppercase">Total Focus</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                              <p className="text-brand font-black text-xl">{productivityMetrics.todayCompleted}</p>
                              <p className="text-[9px] font-black text-white/40 uppercase">Tasks</p>
                           </div>
                           <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-right">
                              <p className="text-emerald-400 font-black text-xl">{streakStats.current}D</p>
                              <p className="text-[9px] font-black text-white/40 uppercase">Streak</p>
                           </div>
                        </div>
                      </div>
                    )}

                    {/* Weekly Blueprint */}
                    {activeBlueprint === 'weekly-spark' && (
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div className="flex justify-between items-center mb-3">
                           <p className="text-white text-xs font-black uppercase tracking-widest">Weekly Sync</p>
                           <p className="text-brand text-xs font-black">{productivityMetrics.weeklyTimeStr}</p>
                        </div>
                        <div className="flex-1">
                          <ResponsiveContainer width="100%" height="80%">
                            <BarChart data={productivityMetrics.last7Days}>
                              <Bar dataKey="count" radius={[4,4,0,0]}>
                                {productivityMetrics.last7Days.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={index === 6 ? 'var(--brand-primary)' : 'rgba(255,255,255,0.2)'} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex justify-between mt-2">
                           {productivityMetrics.last7Days.map(d => (
                             <span key={d.day} className="text-[8px] font-black text-white/30">{d.day.charAt(0)}</span>
                           ))}
                        </div>
                      </div>
                    )}

                    {/* Motivational Footer */}
                    {widgetSize === 'large' && (
                      <div className="mt-6 pt-6 border-t border-white/10 text-center">
                         <p className="text-white font-black italic">"{productivityMetrics.motivation}"</p>
                         <p className="text-[9px] font-black text-white/30 uppercase mt-2 tracking-[0.3em]">Last Sync: Just Now</p>
                      </div>
                    )}
                  </div>

                  {/* Simulated App Icons */}
                  <div className="mt-12 grid grid-cols-4 gap-6 w-full">
                     {[1,2,3,4].map(i => (
                       <div key={i} className="flex flex-col items-center gap-1.5">
                          <div className="w-14 h-14 bg-white/10 backdrop-blur-lg border border-white/10 rounded-[1.25rem] flex items-center justify-center text-xl text-white/40">
                            {i === 1 ? '📸' : i === 2 ? '💬' : i === 3 ? '🎵' : '⚙️'}
                          </div>
                          <span className="text-[10px] text-white/50 font-medium">App {i}</span>
                       </div>
                     ))}
                  </div>
               </div>

               {/* Home Indicator */}
               <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full"></div>
            </div>

            {/* Controls */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-center gap-8">
               <div className="flex flex-col items-center gap-4">
                  <p className="text-xs font-black uppercase text-slate-400">Layout Size</p>
                  <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <button onClick={() => setWidgetSize('small')} className={`px-5 py-2 text-[10px] font-black rounded-xl transition-all ${widgetSize === 'small' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>2x2</button>
                    <button onClick={() => setWidgetSize('medium')} className={`px-5 py-2 text-[10px] font-black rounded-xl transition-all ${widgetSize === 'medium' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>4x2</button>
                    <button onClick={() => setWidgetSize('large')} className={`px-5 py-2 text-[10px] font-black rounded-xl transition-all ${widgetSize === 'large' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>4x4</button>
                  </div>
               </div>
               <div className="flex flex-col items-center gap-4">
                  <p className="text-xs font-black uppercase text-slate-400">Environment</p>
                  <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <button onClick={() => setWallpaper('dark')} className={`px-5 py-2 text-[10px] font-black rounded-xl transition-all ${wallpaper === 'dark' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>Night</button>
                    <button onClick={() => setWallpaper('light')} className={`px-5 py-2 text-[10px] font-black rounded-xl transition-all ${wallpaper === 'light' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>Day</button>
                  </div>
               </div>
               <button className="flex-1 md:self-end bg-brand text-white py-4 px-8 rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-brand/20 active:scale-95 transition-transform">
                  Deploy to Android
               </button>
            </div>
          </div>
        )}

        {activeTab === 'streaks' && (
          <div className="space-y-10 animate-in fade-in duration-300">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-brand p-8 rounded-[2.5rem] text-white shadow-xl">
                   <p className="text-xs font-black uppercase tracking-widest opacity-70">Current Heat</p>
                   <p className="text-6xl font-black mt-2">{streakStats.current}D</p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-[2.5rem] dark:text-white">
                   <p className="text-xs font-black uppercase tracking-widest text-slate-400">Personal Legend</p>
                   <p className="text-6xl font-black mt-2">{streakStats.longest}D</p>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <div>
              <h3 className="text-2xl font-black tracking-tight dark:text-white mb-2">Interface Style</h3>
              <p className="text-slate-500 text-sm">Fine-tune the aesthetic pulse of ProductivePulse.</p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {THEME_COLORS.map(color => (
                <button 
                  key={color.hex} 
                  onClick={() => onUpdateUser({ ...user, themeColor: color.hex })}
                  className={`w-full aspect-square rounded-[1.5rem] transition-all flex items-center justify-center ${user.themeColor === color.hex ? 'ring-4 ring-offset-4 dark:ring-offset-slate-900 scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: color.hex }}
                >
                  {user.themeColor === color.hex && <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg>}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <div>
              <h3 className="text-2xl font-black tracking-tight dark:text-white mb-2">Notification Center</h3>
              <p className="text-slate-500 text-sm">System-level access for timely focus reminders.</p>
            </div>

            <div className={`p-8 rounded-[2.5rem] border transition-all ${user.notificationSettings.enabled ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'}`}>
               <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-4xl shadow-lg transition-all ${user.notificationSettings.enabled ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                    {user.notificationSettings.enabled ? '🔔' : '🔕'}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                     <p className="text-xl font-black dark:text-white">System Reminders</p>
                     <p className="text-slate-500 text-sm mt-1">Receive Pulse alerts when the app is backgrounded.</p>
                  </div>
                  <button 
                    onClick={requestNotificationPermission}
                    className={`px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 ${
                      user.notificationSettings.enabled ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-brand text-white hover:bg-brand/90'
                    }`}
                  >
                    {user.notificationSettings.enabled ? 'Access Granted' : 'Enable Access'}
                  </button>
               </div>

               {user.notificationSettings.enabled && (
                 <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-emerald-500/10 animate-in slide-in-from-top-4">
                    <ToggleField 
                      label="Morning Motivation" 
                      desc="09:00 AM Prompt" 
                      active={user.notificationSettings.morningReminder} 
                      onToggle={() => onUpdateUser({...user, notificationSettings: {...user.notificationSettings, morningReminder: !user.notificationSettings.morningReminder}})} 
                    />
                    <ToggleField 
                      label="Evening Summary" 
                      desc="21:00 PM Recap" 
                      active={user.notificationSettings.eveningSummary} 
                      onToggle={() => onUpdateUser({...user, notificationSettings: {...user.notificationSettings, eveningSummary: !user.notificationSettings.eveningSummary}})} 
                    />
                 </div>
               )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean, onClick: () => void, icon: string, label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${active ? 'bg-brand text-white shadow-xl shadow-brand/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:translate-x-1'}`}
  >
    <span className="text-xl">{icon}</span>
    <span className="font-black text-sm tracking-tight">{label}</span>
  </button>
);

const ToggleField: React.FC<{ label: string, desc: string, active: boolean, onToggle: () => void }> = ({ label, desc, active, onToggle }) => (
  <button onClick={onToggle} className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-emerald-500/10 rounded-3xl hover:border-emerald-500/30 transition-all text-left">
     <div>
       <p className="text-sm font-black dark:text-white">{label}</p>
       <p className="text-[10px] text-slate-500 font-bold uppercase">{desc}</p>
     </div>
     <div className={`w-12 h-6 rounded-full p-1 transition-all ${active ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}>
        <div className={`w-4 h-4 bg-white rounded-full transition-all transform ${active ? 'translate-x-6' : 'translate-x-0'}`}></div>
     </div>
  </button>
);

const THEME_COLORS = [
  { name: 'Classic Indigo', hex: '#4f46e5' },
  { name: 'Forest Green', hex: '#059669' },
  { name: 'Sunset Orange', hex: '#ea580c' },
  { name: 'Deep Purple', hex: '#7c3aed' },
  { name: 'Rose Red', hex: '#e11d48' },
  { name: 'Ocean Blue', hex: '#0ea5e9' },
];

export default AdvancedOptions;
