
import React, { useState } from 'react';
import { User, HistoryData, Note, Priority, Recurrence } from '../types';
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
  
  // Detailed Reminder Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [recurring, setRecurring] = useState<Recurrence>('none');

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

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueTime) return;
    const newNote: Note = {
      id: Date.now().toString(),
      title,
      text,
      dueTime: new Date(dueTime).toISOString(),
      priority,
      recurring,
      completed: false,
      notified: false,
      createdAt: Date.now()
    };
    onUpdateNotes([newNote, ...notes]);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setText('');
    setDueTime('');
    setPriority('medium');
    setRecurring('none');
    setIsFormOpen(false);
  };

  const toggleNoteCompletion = (id: string) => {
    onUpdateNotes(notes.map(n => n.id === id ? { ...n, completed: !n.completed } : n));
  };

  const snoozeNote = (id: string) => {
    onUpdateNotes(notes.map(n => {
      if (n.id === id) {
        const nextTime = new Date();
        nextTime.setMinutes(nextTime.getMinutes() + 10); // Snooze for 10 mins
        return { ...n, dueTime: nextTime.toISOString(), notified: false };
      }
      return n;
    }));
  };

  const deleteNote = (id: string) => {
    onUpdateNotes(notes.filter(n => n.id !== id));
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
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[600px]">
             <div className="p-6 bg-slate-950 text-white flex justify-between items-center">
               <h4 className="text-lg font-black tracking-tighter flex items-center gap-2">
                 Reminders <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
               </h4>
               <button 
                 onClick={() => setIsFormOpen(!isFormOpen)}
                 className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isFormOpen ? 'bg-rose-500 rotate-45' : 'bg-brand shadow-lg shadow-brand/20'}`}
               >
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M12 4v16m8-8H4" /></svg>
               </button>
             </div>

             {isFormOpen && (
               <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 animate-in slide-in-from-top-4 duration-300">
                  <form onSubmit={handleAddReminder} className="space-y-4">
                     <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Reminder Title..."
                      className="w-full px-4 py-3 text-sm font-black bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-brand outline-none transition-all dark:text-white"
                      required
                     />
                     <textarea 
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Notes (optional)..."
                      className="w-full px-4 py-3 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-brand outline-none transition-all dark:text-white resize-none h-20"
                     />
                     <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Due Time</label>
                          <input 
                            type="datetime-local" 
                            value={dueTime}
                            onChange={(e) => setDueTime(e.target.value)}
                            className="w-full px-3 py-3 text-[10px] font-black uppercase bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-500"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Priority</label>
                          <select 
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as Priority)}
                            className="w-full px-3 py-3 text-[10px] font-black uppercase bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-500"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                     </div>
                     <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Repeat</label>
                        <div className="flex gap-2">
                           {(['none', 'daily', 'weekly'] as Recurrence[]).map(r => (
                             <button 
                               key={r}
                               type="button"
                               onClick={() => setRecurring(r)}
                               className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl border transition-all ${recurring === r ? 'bg-brand border-brand text-white shadow-lg' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'}`}
                             >
                               {r}
                             </button>
                           ))}
                        </div>
                     </div>
                     <button type="submit" className="w-full py-4 bg-brand text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand/20 active:scale-95">
                        Set Reminder
                     </button>
                  </form>
               </div>
             )}

             <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                {notes.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-10">
                    <div className="text-4xl mb-4">🔔</div>
                    <p className="text-[10px] font-black uppercase tracking-widest">No active reminders</p>
                  </div>
                ) : (
                  notes.map(note => (
                    <div key={note.id} className={`relative pl-7 group transition-all ${note.completed ? 'opacity-50 grayscale' : ''}`}>
                       <div className={`absolute left-0 top-2 w-3 h-3 rounded-full border-2 bg-white dark:bg-slate-900 z-10 ${
                         note.completed ? 'bg-emerald-500 border-emerald-500' : 
                         note.priority === 'high' ? 'bg-rose-500 border-rose-500' : 
                         note.priority === 'medium' ? 'bg-amber-500 border-amber-500' : 'bg-slate-200 border-slate-200'
                       }`}></div>
                       <div className="p-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start gap-2">
                             <div>
                               <p className={`text-sm font-black dark:text-white ${note.completed ? 'line-through' : ''}`}>{note.title}</p>
                               <p className="text-[10px] font-bold text-slate-500 mt-1">{note.text}</p>
                             </div>
                             {note.recurring !== 'none' && (
                               <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400">🔄 {note.recurring}</span>
                             )}
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                             <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-lg">
                                {new Date(note.dueTime).toLocaleDateString([], {month:'short', day:'numeric'})} • {new Date(note.dueTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                             </span>
                             <div className="flex gap-2">
                               {!note.completed && (
                                 <button onClick={() => snoozeNote(note.id)} title="Snooze 10m" className="p-2 text-slate-400 hover:text-amber-500 transition-colors">
                                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2}/></svg>
                                 </button>
                               )}
                               <button onClick={() => toggleNoteCompletion(note.id)} title={note.completed ? 'Mark Pending' : 'Mark Done'} className={`p-2 transition-colors ${note.completed ? 'text-emerald-500' : 'text-slate-400 hover:text-emerald-500'}`}>
                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7" strokeWidth={3}/></svg>
                               </button>
                               <button onClick={() => deleteNote(note.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg>
                               </button>
                             </div>
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
