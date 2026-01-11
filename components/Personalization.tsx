
import React, { useState } from 'react';
import { ACTIVITIES, CATEGORIES } from '../constants';
import { GoogleGenAI } from "@google/genai";

interface PersonalizationProps {
  initialSelection: string[];
  onSave: (selectedIds: string[]) => void;
}

const Personalization: React.FC<PersonalizationProps> = ({ initialSelection, onSave }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelection);
  const [aiGoal, setAiGoal] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);

  const toggleActivity = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAiSuggest = async () => {
    if (!aiGoal.trim()) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        A user wants to achieve this goal: "${aiGoal}".
        Select the most relevant activities from this list to help them succeed.
        List of available activities (IDs only): ${ACTIVITIES.map(a => a.id).join(', ')}.
        Return ONLY a comma-separated list of IDs. No explanations. No other text.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const text = response.text || "";
      const suggestedIds = text.split(',').map(s => s.trim()).filter(id => ACTIVITIES.some(a => a.id === id));
      
      if (suggestedIds.length > 0) {
        setSelectedIds(suggestedIds);
        setAiGoal('');
        setShowAiInput(false);
      }
    } catch (error) {
      console.error("Gemini Error:", error);
      alert("Pulse Intelligence is offline. Please select manually.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSave = () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one activity to track!");
      return;
    }
    onSave(selectedIds);
  };

  return (
    <div className="space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="text-center max-w-3xl mx-auto space-y-4">
        <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
          Personalize Your Journey
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
          Configure your daily pulse. Select the activities that define your personal growth.
        </p>

        {/* AI Suggestion Box */}
        <div className="mt-8">
          {!showAiInput ? (
            <button 
              onClick={() => setShowAiInput(true)}
              className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center gap-2 mx-auto"
            >
              <span className="text-lg">✨</span> Let AI Suggest Goals
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto animate-in zoom-in-95 duration-300">
              <input 
                type="text" 
                value={aiGoal}
                onChange={(e) => setAiGoal(e.target.value)}
                placeholder="Ex: I want to be a fit software engineer..."
                className="flex-1 px-5 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:outline-none focus:border-brand transition-all dark:text-white"
                onKeyDown={(e) => e.key === 'Enter' && handleAiSuggest()}
              />
              <button 
                onClick={handleAiSuggest}
                disabled={isAiLoading}
                className="px-6 py-3 bg-brand text-white rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-50 transition-all shadow-lg"
              >
                {isAiLoading ? 'Analyzing...' : 'Match'}
              </button>
              <button onClick={() => setShowAiInput(false)} className="px-4 py-3 text-slate-400 hover:text-slate-600 font-black text-xs uppercase">Cancel</button>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {CATEGORIES.map(category => (
          <section key={category.id} className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col transition-all hover:shadow-2xl dark:hover:border-slate-700">
            <div className={`px-8 py-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 ${category.lightColor}`}>
              <div className="flex items-center gap-4">
                <div className={`w-3 h-8 rounded-full ${category.color} shadow-lg shadow-brand/10`}></div>
                <div>
                  <h3 className={`font-black uppercase tracking-widest text-[11px] ${category.textColor}`}>
                    {category.label}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Category Core</p>
                </div>
              </div>
              <span className={`text-[10px] font-black px-4 py-1.5 rounded-full ${category.color} text-white shadow-lg`}>
                {ACTIVITIES.filter(a => a.category === category.id && selectedIds.includes(a.id)).length} Active
              </span>
            </div>
            
            <div className="p-8 grid grid-cols-1 gap-4">
              {ACTIVITIES.filter(a => a.category === category.id).map(activity => {
                const isSelected = selectedIds.includes(activity.id);
                return (
                  <button
                    key={activity.id}
                    onClick={() => toggleActivity(activity.id)}
                    className={`group flex items-center gap-5 p-5 rounded-3xl border transition-all duration-300 ${
                      isSelected 
                        ? 'bg-brand/5 dark:bg-brand/10 border-brand/40 dark:border-brand/60 shadow-inner scale-[1.01]' 
                        : 'bg-transparent border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-14 h-14 flex items-center justify-center text-3xl rounded-2xl transition-all ${isSelected ? 'bg-brand text-white shadow-xl rotate-3' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                      {activity.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <span className={`block text-base font-black ${isSelected ? 'text-brand dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                        {activity.name}
                      </span>
                      <span className={`text-[10px] font-black uppercase tracking-tight ${isSelected ? 'text-brand/70' : 'text-slate-400'}`}>
                        {isSelected ? 'Pulse Monitoring Enabled' : 'Inactive Component'}
                      </span>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      isSelected ? 'bg-brand border-brand scale-110 shadow-lg' : 'bg-transparent border-slate-200 dark:border-slate-800'
                    }`}>
                      {isSelected && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={5}>
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Floating Action Bar */}
      <div className="sticky bottom-10 flex justify-center z-40">
        <div className="bg-slate-900/90 dark:bg-white/90 backdrop-blur-2xl p-2 rounded-[2.5rem] shadow-2xl flex items-center gap-4">
          <div className="px-6">
            <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">Total Active</p>
            <p className="text-xl font-black text-white dark:text-slate-950">{selectedIds.length} <span className="text-xs font-bold text-slate-500">Activities</span></p>
          </div>
          <button
            onClick={handleSave}
            className="bg-brand text-white px-10 py-5 rounded-[2rem] font-black text-lg hover:scale-105 shadow-xl transition-all active:scale-95 flex items-center gap-3"
          >
            Deploy Pulse
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Personalization;
