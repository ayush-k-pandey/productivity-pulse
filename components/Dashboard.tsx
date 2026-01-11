
import React, { useState } from 'react';
import { User, HistoryData, Note } from '../types';
import { ACTIVITIES, CATEGORIES } from '../constants';
import confetti from 'canvas-confetti';

interface DashboardProps {
  user: User;
  history: HistoryData;
  notes: Note[];
  onUpdate: (date: string, activityId: string, completed: boolean) => void;
  onUpdateNotes: (notes: Note[]) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, history, notes, onUpdate, onUpdateNotes }) => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [noteText, setNoteText] = useState('');
  const [noteDateTime, setNoteDateTime] = useState('');

  const userActivities = ACTIVITIES.filter(a => user.selectedActivityIds.includes(a.id));
  const dayData = history[selectedDate] || {};
  const completedCount = userActivities.filter(a => dayData[a.id]).length;

  const toggleActivity = (id: string) => {
    const isNowCompleted = !dayData[id];
    if (isNowCompleted) {
      const count = 150;
      const defaults = { origin: { y: 0.7 }, colors: [user.themeColor, '#10b981', '#f59e0b'], disableForReducedMotion: true };
      const fire = (particleRatio: number, opts: any) => {
        confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
      };
      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    }
    onUpdate(selectedDate, id, isNowCompleted);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText || !noteDateTime) return;
    const newNote: Note = {
      id: Date.now().toString(),
      text: noteText,
      dueTime: new Date(noteDateTime).toISOString(),
      notified: false,
      createdAt: Date.now()
    };
    onUpdateNotes([newNote, ...notes]);
    setNoteText('');
    setNoteDateTime('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tight dark:text-white">
            Hello, {user.name.split(' ')[0]} ⚡️
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-bold">Your daily productivity pulse.</p>
        </div>
        <div className="flex items-center bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-1.5">
          <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate()-1); setSelectedDate(d.toISOString().split('T')[0]) }} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 19l-7-7 7-7" strokeWidth={3} /></svg>
          </button>
          <span className="px-4 text-xs font-black uppercase tracking-widest">{selectedDate === today ? 'Today' : selectedDate}</span>
          <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate()+1); setSelectedDate(d.toISOString().split('T')[0]) }} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" strokeWidth={3} /></svg>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-8 rounded-3xl text-white shadow-xl flex flex-col justify-between h-48 relative overflow-hidden group">
             <div className="absolute -right-4 -bottom-4 text-9xl opacity-10 group-hover:scale-110 transition-transform">📊</div>
             <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Completion</span>
             <div>
               <p className="text-5xl font-black">{(completedCount / Math.max(1, userActivities.length) * 100).toFixed(0)}%</p>
               <p className="text-[10px] font-bold opacity-70 mt-1 uppercase">{completedCount} of {userActivities.length} Tasks Done</p>
             </div>
         </div>

         <div className="md:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center h-48">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Daily Focus Status</p>
            <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800">
               <div className="h-full bg-brand transition-all duration-1000 shadow-lg shadow-brand/20" style={{width: `${(completedCount / Math.max(1, userActivities.length) * 100)}%`}}></div>
            </div>
            <p className="mt-4 text-sm font-bold text-slate-500 dark:text-slate-400 italic">
               "{completedCount === userActivities.length ? 'Perfect score today! Absolute champion.' : completedCount > 0 ? 'Building momentum. Every task counts!' : 'Start your first task to ignite the pulse.'}"
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
           {CATEGORIES.map(cat => {
             const items = userActivities.filter(a => a.category === cat.id);
             if (items.length === 0) return null;
             return (
               <div key={cat.id} className="space-y-4">
                 <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] pl-1 flex items-center gap-2">
                   <div className={`w-1.5 h-1.5 rounded-full ${cat.color}`}></div>
                   {cat.label}
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {items.map(activity => {
                     const isDone = !!dayData[activity.id];
                     return (
                       <button 
                         key={activity.id} 
                         onClick={() => toggleActivity(activity.id)}
                         className={`group flex items-center gap-4 p-4 rounded-[1.75rem] border transition-all duration-300 ${isDone ? 'bg-white dark:bg-slate-900 border-brand shadow-lg scale-[1.02]' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300'}`}
                       >
                         <div className={`w-12 h-12 flex items-center justify-center text-2xl rounded-2xl transition-all ${isDone ? 'bg-brand text-white shadow-lg rotate-3' : 'bg-slate-50 dark:bg-slate-800'}`}>
                           {activity.icon}
                         </div>
                         <div className="flex-1 text-left">
                           <p className={`text-sm font-bold ${isDone ? 'text-brand' : 'text-slate-700 dark:text-slate-300'}`}>{activity.name}</p>
                           <p className="text-[10px] font-black text-slate-400 uppercase mt-0.5">{isDone ? 'Completed' : 'Pending'}</p>
                         </div>
                       </button>
                     );
                   })}
                 </div>
               </div>
             );
           })}
        </div>

        <div className="lg:sticky lg:top-24 space-y-4">
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[520px]">
             <div className="p-6 bg-slate-950 text-white">
               <h4 className="text-lg font-black tracking-tighter flex items-center gap-2">
                 Daily Log <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
               </h4>
             </div>
             <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <form onSubmit={handleAddNote} className="space-y-2">
                   <input 
                    type="text" 
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Capture a thought..."
                    className="w-full px-4 py-3 text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-brand outline-none transition-all dark:text-white"
                   />
                   <div className="flex gap-2">
                      <input 
                        type="datetime-local" 
                        value={noteDateTime}
                        onChange={(e) => setNoteDateTime(e.target.value)}
                        className="flex-1 px-3 py-2 text-[9px] font-black uppercase bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-500"
                      />
                      <button type="submit" className="p-3 bg-brand text-white rounded-xl shadow-lg active:scale-90">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4v16m8-8H4" strokeWidth={3}/></svg>
                      </button>
                   </div>
                </form>
             </div>
             <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                {notes.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-10">
                    <div className="text-4xl mb-4">📓</div>
                    <p className="text-[10px] font-black uppercase tracking-widest">No entries yet</p>
                  </div>
                ) : (
                  notes.map(note => (
                    <div key={note.id} className="relative pl-7 group">
                       <div className={`absolute left-0 top-2 w-3 h-3 rounded-full border-2 bg-white dark:bg-slate-900 z-10 ${note.notified ? 'border-emerald-500' : 'border-brand'}`}></div>
                       <div className="p-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl">
                          <p className="text-xs font-bold dark:text-slate-300">{note.text}</p>
                          <div className="mt-3 flex items-center justify-between">
                             <span className="text-[9px] font-black text-slate-400 uppercase">{new Date(note.dueTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                             <button onClick={() => onUpdateNotes(notes.filter(n => n.id !== note.id))} className="text-slate-300 hover:text-rose-500 transition-colors">
                               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg>
                             </button>
                          </div>
                       </div>
                    </div>
                  ))
                )}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
