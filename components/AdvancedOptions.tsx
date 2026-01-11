
import React, { useState, useMemo } from 'react';
import { User, HistoryData, Note } from '../types';
import { ACTIVITIES } from '../constants';
import Logo from './Logo';
import { 
  BarChart, 
  Bar, 
  ResponsiveContainer, 
  XAxis as ReXAxis, 
  YAxis as ReYAxis,
  Cell
} from 'recharts';

interface AdvancedOptionsProps {
  user: User;
  history: HistoryData;
  notes: Note[];
  onUpdateUser: (user: User) => void;
  onRestore: (data: { user: User, history: HistoryData, notes: Note[] }) => void;
}

const THEME_COLORS = [
  { name: 'Classic Indigo', hex: '#4f46e5' },
  { name: 'Forest Green', hex: '#059669' },
  { name: 'Sunset Orange', hex: '#ea580c' },
  { name: 'Deep Purple', hex: '#7c3aed' },
  { name: 'Rose Red', hex: '#e11d48' },
  { name: 'Ocean Blue', hex: '#0ea5e9' },
];

type TabId = 'appearance' | 'widgets' | 'streaks' | 'security';
type WidgetBlueprint = 'summary' | 'progress' | 'heatmap';

const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({ user, history, notes, onUpdateUser, onRestore }) => {
  const [activeTab, setActiveTab] = useState<TabId>('appearance');
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [widgetSize, setWidgetSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [activeBlueprint, setActiveBlueprint] = useState<WidgetBlueprint>('progress');

  const toggleWidget = (id: string) => {
    const active = user.activeWidgets.includes(id)
      ? user.activeWidgets.filter(w => w !== id)
      : [...user.activeWidgets, id];
    onUpdateUser({ ...user, activeWidgets: active });
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support system notifications.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      onUpdateUser({ 
        ...user, 
        notificationSettings: { ...user.notificationSettings, enabled: true } 
      });
    }
  };

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
        if (!lastDate) {
          tempLongest = 1;
        } else {
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

  const heatmap = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const completed = history[dStr] ? Object.values(history[dStr]).filter(v => v).length : 0;
      data.push({ 
        date: dStr, 
        count: completed,
        day: d.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    return data;
  }, [history]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[600px] animate-in fade-in slide-in-from-bottom-6 duration-700">
      <aside className="lg:w-64 space-y-2 flex-shrink-0">
        <h2 className="text-xl font-black mb-6 dark:text-white px-2">Command Center</h2>
        <TabButton active={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')} icon="🎨" label="Appearance" />
        <TabButton active={activeTab === 'widgets'} onClick={() => setActiveTab('widgets')} icon="🧩" label="Widget Architect" />
        <TabButton active={activeTab === 'streaks'} onClick={() => setActiveTab('streaks')} icon="🔥" label="Streaks Hub" />
        <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon="🛡️" label="Notifications & Access" />
      </aside>

      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
        {activeTab === 'appearance' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <div>
              <h3 className="text-2xl font-black tracking-tight dark:text-white mb-2">Visual Identity</h3>
              <p className="text-slate-500 text-sm">Fine-tune the aesthetic pulse of your interface.</p>
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

        {activeTab === 'widgets' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-2xl font-black tracking-tight dark:text-white mb-2">Widget Architect</h3>
                <p className="text-slate-500 text-sm">Deploy live data summaries to your system home screen.</p>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                 <button onClick={() => setActiveBlueprint('progress')} className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all ${activeBlueprint === 'progress' ? 'bg-brand text-white' : 'text-slate-500 hover:text-slate-700'}`}>Progress</button>
                 <button onClick={() => setActiveBlueprint('summary')} className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all ${activeBlueprint === 'summary' ? 'bg-brand text-white' : 'text-slate-500 hover:text-slate-700'}`}>Summary</button>
                 <button onClick={() => setActiveBlueprint('heatmap')} className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all ${activeBlueprint === 'heatmap' ? 'bg-brand text-white' : 'text-slate-500 hover:text-slate-700'}`}>Heatmap</button>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-8 sm:p-12 rounded-[3.5rem] border-4 border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden">
               <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
               
               <div className={`transition-all duration-700 bg-white dark:bg-slate-900 shadow-2xl rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between overflow-hidden group ${
                 widgetSize === 'small' ? 'w-44 h-44' : 
                 widgetSize === 'medium' ? 'w-full max-w-[340px] h-44' : 'w-full max-w-[340px] h-80'
               }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Logo size={24} />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">ProductivePulse</span>
                    </div>
                    <span className="text-[10px] font-black text-brand bg-brand/10 px-2 py-0.5 rounded-full">{streakStats.current}D 🔥</span>
                  </div>

                  {activeBlueprint === 'progress' && (
                    <div className="flex-1 mt-4">
                      <div className="flex justify-between items-end mb-1">
                         <p className="text-xl font-black dark:text-white">Goal Progress</p>
                         <p className="text-[10px] font-black text-slate-400">76%</p>
                      </div>
                      <div className="h-10 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={heatmap.slice(-7)}>
                            <Bar dataKey="count" radius={[4,4,0,0]}>
                              {heatmap.slice(-7).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 6 ? 'var(--brand-primary)' : 'var(--brand-primary-light)'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {activeBlueprint === 'summary' && (
                    <div className="flex-1 flex flex-col justify-center gap-2 mt-4">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-sm">📅</div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">Tasks Today</p>
                            <p className="text-lg font-black dark:text-white">{heatmap[29].count} Completed</p>
                          </div>
                       </div>
                       {widgetSize === 'large' && (
                         <div className="flex items-center gap-3 mt-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-sm">🏃</div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase">Top Category</p>
                              <p className="text-lg font-black dark:text-white">Physical</p>
                            </div>
                         </div>
                       )}
                    </div>
                  )}

                  {activeBlueprint === 'heatmap' && (
                    <div className="flex-1 mt-4 grid grid-cols-7 gap-1">
                       {heatmap.slice(-21).map((h, i) => (
                         <div key={i} title={h.date} className={`aspect-square rounded-[4px] ${h.count > 4 ? 'bg-brand' : h.count > 0 ? 'bg-brand/40' : 'bg-slate-100 dark:bg-slate-800'}`}></div>
                       ))}
                    </div>
                  )}

                  <div className="mt-4 flex justify-between items-end">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Live: {new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                    {widgetSize === 'large' && <button className="px-3 py-1 bg-brand text-white text-[9px] font-black uppercase rounded-lg">Sync</button>}
                  </div>
               </div>

               <div className="mt-12 flex gap-3">
                  <SizeBtn active={widgetSize === 'small'} onClick={() => setWidgetSize('small')}>2x2</SizeBtn>
                  <SizeBtn active={widgetSize === 'medium'} onClick={() => setWidgetSize('medium')}>2x4</SizeBtn>
                  <SizeBtn active={widgetSize === 'large'} onClick={() => setWidgetSize('large')}>4x4</SizeBtn>
               </div>
            </div>

            <button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-6 rounded-3xl font-black text-lg shadow-xl shadow-brand/10 flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform active:scale-95">
               Deploy Widget to Device
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth={3}/></svg>
            </button>
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
             <div className="p-8 border border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Consistency Map</p>
                <div className="flex flex-wrap gap-2">
                   {heatmap.map((h, i) => (
                     <div key={i} className={`w-8 h-8 rounded-lg ${h.count > 0 ? 'bg-brand' : 'bg-slate-100 dark:bg-slate-800'} transition-all hover:scale-125`} title={h.date}></div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <div>
              <h3 className="text-2xl font-black tracking-tight dark:text-white mb-2">Notification Command Center</h3>
              <p className="text-slate-500 text-sm">Manage how Pulse interacts with your system environment.</p>
            </div>

            <div className={`p-8 rounded-[2.5rem] border transition-all ${user.notificationSettings.enabled ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'}`}>
               <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-4xl shadow-lg transition-all ${user.notificationSettings.enabled ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                    {user.notificationSettings.enabled ? '🔔' : '🔕'}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                     <p className="text-xl font-black dark:text-white">System Reminders</p>
                     <p className="text-slate-500 text-sm mt-1">Receive Pulse alerts when the app is in background or closed.</p>
                  </div>
                  <button 
                    onClick={requestNotificationPermission}
                    className={`px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 ${
                      user.notificationSettings.enabled ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-brand text-white hover:bg-brand/90'
                    }`}
                  >
                    {user.notificationSettings.enabled ? 'Access Granted' : 'Enable System Access'}
                  </button>
               </div>

               {user.notificationSettings.enabled && (
                 <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-emerald-500/10 animate-in slide-in-from-top-4">
                    <ToggleField 
                      label="Morning Motivation" 
                      desc="Scheduled for 09:00 AM" 
                      active={user.notificationSettings.morningReminder} 
                      onToggle={() => onUpdateUser({...user, notificationSettings: {...user.notificationSettings, morningReminder: !user.notificationSettings.morningReminder}})} 
                    />
                    <ToggleField 
                      label="Evening Summary" 
                      desc="Daily score at 09:00 PM" 
                      active={user.notificationSettings.eveningSummary} 
                      onToggle={() => onUpdateUser({...user, notificationSettings: {...user.notificationSettings, eveningSummary: !user.notificationSettings.eveningSummary}})} 
                    />
                 </div>
               )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] space-y-4">
                 <p className="font-black dark:text-white">Portable Backup</p>
                 <p className="text-xs text-slate-500">Download a JSON archive of your entire focus history.</p>
                 <button onClick={() => {}} className="w-full py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">Generate Export</button>
              </div>
              <div className="p-8 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] space-y-4">
                 <p className="font-black dark:text-white">Restore Session</p>
                 <p className="text-xs text-slate-500">Upload a pulse_backup.json to restore your data.</p>
                 <label className="block w-full py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all text-center cursor-pointer">
                   Select File
                   <input type="file" onChange={(e) => {}} className="hidden" accept=".json" />
                 </label>
              </div>
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

const SizeBtn: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button 
    onClick={onClick} 
    className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${active ? 'bg-brand text-white shadow-lg' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 hover:bg-slate-300'}`}
  >
    {children}
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

export default AdvancedOptions;
