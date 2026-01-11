
import React, { useMemo, useState } from 'react';
import { HistoryData, User } from '../types';
import { ACTIVITIES, CATEGORIES } from '../constants';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis as BarXAxis,
  YAxis as BarYAxis
} from 'recharts';

interface AnalyticsProps {
  history: HistoryData;
  user: User;
}

const Analytics: React.FC<AnalyticsProps> = ({ history, user }) => {
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly'>('weekly');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const userActivities = ACTIVITIES.filter(a => user.selectedActivityIds.includes(a.id));
  const isDark = user.isDarkMode;

  // Chart configuration based on theme
  const chartColors = {
    text: isDark ? '#94a3b8' : '#64748b',
    grid: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    tooltipBg: isDark ? '#0f172a' : '#ffffff',
    tooltipBorder: isDark ? '#1e293b' : '#e2e8f0',
  };

  const chartData = useMemo(() => {
    const days = timeRange === 'weekly' ? 7 : 30;
    const result = [];
    const referenceDate = new Date(endDate);

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(referenceDate);
      date.setDate(referenceDate.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = history[dateStr] || {};
      
      const points = userActivities.filter(a => dayData[a.id]).length;
      
      result.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
        fullDate: dateStr,
        points,
      });
    }
    return result;
  }, [history, timeRange, endDate, userActivities]);

  const stats = useMemo(() => {
    const totalPoints = Object.values(history).reduce((acc: number, day) => {
      return acc + userActivities.filter(a => day[a.id]).length;
    }, 0);
    
    const daysTracked = Object.keys(history).length || 1;
    const avgPoints = (totalPoints / daysTracked).toFixed(1);
    const efficiency = Math.round((totalPoints / (daysTracked * Math.max(1, userActivities.length))) * 100);
    
    return { totalPoints, avgPoints, daysTracked, efficiency };
  }, [history, userActivities]);

  const categoryMix = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(history).forEach(day => {
      Object.keys(day).forEach(activityId => {
        if (day[activityId] && user.selectedActivityIds.includes(activityId)) {
          const activity = ACTIVITIES.find(a => a.id === activityId);
          if (activity) {
            counts[activity.category] = (counts[activity.category] || 0) + 1;
          }
        }
      });
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

    return CATEGORIES.map(cat => ({
      name: cat.label,
      value: counts[cat.id] || 0,
      percentage: Math.round(((counts[cat.id] || 0) / total) * 100),
      color: cat.color.replace('bg-', '')
    })).filter(item => item.value > 0);
  }, [history, user.selectedActivityIds]);

  const getHexColor = (colorName: string) => {
    switch (colorName) {
      case 'emerald-500': return '#10b981';
      case 'indigo-500': return '#6366f1';
      case 'amber-500': return '#f59e0b';
      case 'rose-500': return '#f43f5e';
      case 'purple-500': return '#a855f7';
      default: return user.themeColor;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand"></div>
            <p className="text-lg font-black dark:text-white">{payload[0].value} Tasks Done</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h2 className="text-4xl font-black tracking-tight dark:text-white flex items-center gap-3">
            Pulse Insights
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Quantifying your consistency across {userActivities.length} target goals.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <button 
              onClick={() => setTimeRange('weekly')}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${timeRange === 'weekly' ? 'bg-brand text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              7 Days
            </button>
            <button 
              onClick={() => setTimeRange('monthly')}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${timeRange === 'monthly' ? 'bg-brand text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              30 Days
            </button>
          </div>
          <div className="relative">
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand transition-all dark:text-white cursor-pointer"
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Total Focus" value={stats.totalPoints} unit="Tasks" icon="🎯" color="text-indigo-500" />
        <MetricCard label="Daily Pulse" value={stats.avgPoints} unit="Avg" icon="⚡" color="text-amber-500" />
        <MetricCard label="Commitment" value={stats.daysTracked} unit="Days" icon="🗓️" color="text-emerald-500" />
        <MetricCard label="Efficiency" value={`${stats.efficiency}%`} unit="Score" icon="📈" color="text-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black dark:text-white flex items-center gap-3">
               <div className="w-1.5 h-6 bg-brand rounded-full"></div>
               Consistency Trend
            </h3>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                <XAxis 
                  dataKey="name" 
                  stroke={chartColors.text} 
                  fontSize={10} 
                  fontWeight={800}
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke={chartColors.text} 
                  fontSize={10} 
                  fontWeight={800}
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="points" 
                  stroke="var(--brand-primary)" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorPoints)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h3 className="text-xl font-black dark:text-white mb-8 flex items-center gap-3">
            <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
            Energy Mix
          </h3>
          
          <div className="flex-1 space-y-6">
            {categoryMix.length > 0 ? (
              categoryMix.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                     <div>
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.name}</p>
                       <p className="font-black dark:text-white">{item.value} <span className="text-xs font-normal text-slate-500">instances</span></p>
                     </div>
                     <p className="text-lg font-black text-brand">{item.percentage}%</p>
                  </div>
                  <div className="h-3 w-full bg-slate-50 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ 
                        width: `${item.percentage}%`, 
                        backgroundColor: getHexColor(item.color),
                        boxShadow: isDark ? `0 0 15px ${getHexColor(item.color)}40` : 'none'
                      }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <div className="text-4xl mb-2">🔭</div>
                <p className="text-xs font-black uppercase tracking-widest">No data detected</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string, value: string | number, unit: string, icon: string, color: string }> = ({ label, value, unit, icon, color }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
    <div className="absolute -right-4 -top-4 text-6xl opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">{icon}</div>
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
    <div className="flex items-baseline gap-2">
      <p className="text-4xl font-black dark:text-white tracking-tighter">{value}</p>
      <p className={`text-[10px] font-black uppercase ${color}`}>{unit}</p>
    </div>
  </div>
);

export default Analytics;
