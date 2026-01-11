
import React, { useState, useEffect, useRef } from 'react';
import { User, ViewState, HistoryData, Account, Note, UserDataPayload } from './types';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Personalization from './components/Personalization';
import AdvancedOptions from './components/AdvancedOptions';
import SplashScreen from './components/SplashScreen';
import Logo from './components/Logo';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('splash');
  const [history, setHistory] = useState<HistoryData>({});
  const [notes, setNotes] = useState<Note[]>([]);
  const checkIntervalRef = useRef<number | null>(null);

  // Splash Screen Timer Logic
  useEffect(() => {
    if (view === 'splash') {
      const timer = setTimeout(() => {
        const sessionEmail = sessionStorage.getItem('active_session_email');
        if (sessionEmail) {
          loadUserData(sessionEmail);
        } else {
          setView('auth');
        }
      }, 3000); // 3 seconds total splash time
      return () => clearTimeout(timer);
    }
  }, [view]);

  useEffect(() => {
    if (user?.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    if (user?.themeColor) {
      document.documentElement.style.setProperty('--brand-primary', user.themeColor);
      document.documentElement.style.setProperty('--brand-primary-light', `${user.themeColor}20`);
    }
  }, [user?.isDarkMode, user?.themeColor]);

  // Enhanced Notification Engine with Recurring Logic & Priorities
  useEffect(() => {
    if (user && user.notificationSettings.enabled) {
      checkIntervalRef.current = window.setInterval(() => {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const currentHour = now.getHours();
        
        let changed = false;
        
        // 1. Process Individual Notes & Reminders
        const updatedNotes = notes.map(note => {
          if (!note.completed && !note.notified && new Date(note.dueTime) <= now) {
            const priorityPrefix = note.priority === 'high' ? '🚨 [URGENT] ' : note.priority === 'medium' ? '⚡ [PULSE] ' : '📝 ';
            triggerNotification(priorityPrefix + note.title, note.text);
            
            changed = true;

            // Handle Recurrence
            if (note.recurring !== 'none') {
              const nextDue = new Date(note.dueTime);
              if (note.recurring === 'daily') nextDue.setDate(nextDue.getDate() + 1);
              if (note.recurring === 'weekly') nextDue.setDate(nextDue.getDate() + 7);
              
              return { ...note, dueTime: nextDue.toISOString(), notified: false };
            }

            return { ...note, notified: true };
          }
          return note;
        });

        // 2. Morning Motivation
        if (user.notificationSettings.morningReminder && currentTime === "09:00") {
          triggerNotification("Rise & Pulse", "Today is a fresh canvas. Ignite your productivity!");
        }

        // 3. Evening Summary
        if (user.notificationSettings.eveningSummary && currentTime === "21:00") {
          const today = now.toISOString().split('T')[0];
          const completed = Object.values(history[today] || {}).filter(v => v).length;
          triggerNotification("Day Concluded", `You finished ${completed} goals today. Great work!`);
        }

        // 4. Smart Afternoon Nudge
        if (currentHour === 14 && now.getMinutes() === 0) {
          const today = now.toISOString().split('T')[0];
          const completedCount = Object.values(history[today] || {}).filter(v => v).length;
          const totalTarget = user.selectedActivityIds.length;
          if (completedCount < (totalTarget / 2)) {
             triggerNotification("Afternoon Nudge", "You've still got major goals to hit. Keep going!");
          }
        }

        if (changed) {
          setNotes(updatedNotes);
          saveToDatabase(user, history, updatedNotes);
        }
      }, 60000);
    }
    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [user, notes, history]);

  const triggerNotification = (title: string, body: string) => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification(title, { 
        body,
        icon: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/action/trending_up/materialicons/48dp/1x/baseline_trending_up_black_48dp.png'
      });
    }
  };

  const loadUserData = (email: string) => {
    const storageKey = `pulse_db_${email.toLowerCase()}`;
    const rawData = localStorage.getItem(storageKey);
    if (rawData) {
      const data = JSON.parse(rawData) as UserDataPayload;
      setUser(data.user);
      setHistory(data.history || {});
      setNotes(data.notes || []);
      setView('dashboard');
    } else {
      setView('auth');
    }
  };

  const handleLogin = (loginInfo: Pick<User, 'name' | 'email'>) => {
    const email = loginInfo.email.toLowerCase();
    const storageKey = `pulse_db_${email}`;
    const rawData = localStorage.getItem(storageKey);
    
    let currentUser: User;
    let currentHistory: HistoryData = {};
    let currentNotes: Note[] = [];

    if (rawData) {
      const data = JSON.parse(rawData) as UserDataPayload;
      currentUser = data.user;
      currentHistory = data.history || {};
      currentNotes = data.notes || [];
      currentUser.name = loginInfo.name;
    } else {
      currentUser = {
        name: loginInfo.name,
        email: email,
        selectedActivityIds: [],
        themeColor: '#4f46e5',
        isDarkMode: false,
        activeWidgets: ['streak', 'progress'],
        notificationSettings: {
          enabled: false,
          morningReminder: true,
          eveningSummary: true,
          reminderTime: "09:00"
        }
      };
    }

    const rawAccounts = localStorage.getItem('pulse_accounts');
    let accounts: Account[] = rawAccounts ? JSON.parse(rawAccounts) : [];
    const existingIndex = accounts.findIndex(a => a.email === email);
    const newAccount: Account = { name: currentUser.name, email: email, lastLogin: Date.now() };

    if (existingIndex > -1) accounts[existingIndex] = newAccount;
    else accounts.push(newAccount);
    localStorage.setItem('pulse_accounts', JSON.stringify(accounts));

    setUser(currentUser);
    setHistory(currentHistory);
    setNotes(currentNotes);
    sessionStorage.setItem('active_session_email', email);
    saveToDatabase(currentUser, currentHistory, currentNotes);

    if (currentUser.selectedActivityIds.length === 0) setView('personalization');
    else setView('dashboard');
  };

  const saveToDatabase = (userData: User, historyData: HistoryData, notesData: Note[]) => {
    const storageKey = `pulse_db_${userData.email.toLowerCase()}`;
    localStorage.setItem(storageKey, JSON.stringify({ user: userData, history: historyData, notes: notesData }));
  };

  const updateHistory = (date: string, activityId: string, completed: boolean) => {
    if (!user) return;
    const newHistory = { ...history };
    if (!newHistory[date]) newHistory[date] = {};
    newHistory[date][activityId] = completed;
    
    setHistory(newHistory);
    saveToDatabase(user, newHistory, notes);
  };

  const handleUpdateNotes = (newNotes: Note[]) => {
    if (user) {
      setNotes(newNotes);
      saveToDatabase(user, history, newNotes);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setHistory({});
    setNotes([]);
    sessionStorage.removeItem('active_session_email');
    setView('auth');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col ${user?.isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {view === 'splash' && <SplashScreen />}
      
      {view === 'auth' ? (
        <Auth onLogin={handleLogin} />
      ) : view !== 'splash' ? (
        <>
          <nav className={`sticky top-0 z-50 border-b backdrop-blur-md ${user?.isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('dashboard')}>
                <Logo size={32} className="rounded-lg shadow-sm" />
                <span className="font-black text-lg tracking-tighter hidden sm:block">ProductivePulse</span>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2">
                <NavBtn active={view === 'dashboard'} onClick={() => setView('dashboard')}>Dash</NavBtn>
                <NavBtn active={view === 'analytics'} onClick={() => setView('analytics')}>Stats</NavBtn>
                <NavBtn active={view === 'advanced'} onClick={() => setView('advanced')}>Center</NavBtn>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
                
                <button 
                  onClick={() => { const u = {...user!, isDarkMode: !user!.isDarkMode}; setUser(u); saveToDatabase(u, history, notes); }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                >
                  {user?.isDarkMode ? (
                    <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" /></svg>
                  ) : (
                    <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                  )}
                </button>
                <button onClick={handleLogout} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-full transition-all">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
              </div>
            </div>
          </nav>

          <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 overflow-y-auto">
            {view === 'personalization' && user && (
              <Personalization initialSelection={user.selectedActivityIds} onSave={(ids) => {
                const updatedUser = { ...user, selectedActivityIds: ids };
                setUser(updatedUser);
                saveToDatabase(updatedUser, history, notes);
                setView('dashboard');
              }} />
            )}
            {view === 'dashboard' && user && (
              <Dashboard user={user} history={history} notes={notes} onUpdate={updateHistory} onUpdateNotes={handleUpdateNotes} />
            )}
            {view === 'analytics' && user && (
              <Analytics history={history} user={user} />
            )}
            {view === 'advanced' && user && (
              <AdvancedOptions 
                user={user} 
                history={history} 
                notes={notes}
                onUpdateUser={(u) => { setUser(u); saveToDatabase(u, history, notes); }}
                onRestore={(d) => { setUser(d.user); setHistory(d.history); setNotes(d.notes); saveToDatabase(d.user, d.history, d.notes); }}
              />
            )}
          </main>
        </>
      ) : null}
    </div>
  );
};

const NavBtn: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button 
    onClick={onClick}
    className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all ${active ? 'bg-brand text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
  >
    {children}
  </button>
);

export default App;
