/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList,
  PieChart, Pie, Cell, BarChart, Brush
} from 'recharts';
import { Ship, Truck, HardHat, Package, TrendingUp, ChevronDown, Check, RefreshCw, Settings, Activity, Anchor, Box, Clock, Zap, AlertCircle, Moon, Sun, X, ListTodo } from 'lucide-react';
import { cn } from './lib/utils';
import { io } from 'socket.io-client';
import { motion } from 'motion/react';

const socket = io();

const CraneIcon = ({ size = 24, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 22h16" />
    <path d="M8 22V6l4-4h4" />
    <path d="M12 6v16" />
    <path d="M8 10h4" />
    <path d="M8 16h4" />
    <path d="M16 2v4l5 5v3" />
    <path d="M21 14h-2" />
    <rect x="18" y="14" width="2" height="3" />
  </svg>
);

const iconMap: Record<string, any> = {
  Crane: CraneIcon,
  Ship, Truck, HardHat, Package, Activity, Anchor, Box, Clock, Zap
};

const colorOptions = [
  { name: 'Default', class: 'from-white/95 to-blue-50/95 dark:from-slate-800/95 dark:to-slate-900/95' },
  { name: 'Emerald', class: 'from-emerald-50/95 to-teal-100/95 dark:from-emerald-900/90 dark:to-teal-900/90' },
  { name: 'Slate', class: 'from-slate-50/95 to-slate-200/95 dark:from-slate-800/95 dark:to-slate-700/95' },
  { name: 'Indigo', class: 'from-indigo-50/95 to-blue-100/95 dark:from-indigo-900/90 dark:to-blue-900/90' },
  { name: 'Rose', class: 'from-rose-50/95 to-orange-100/95 dark:from-rose-900/90 dark:to-orange-900/90' }
];

const FilterGroup = ({ title, options, selected, onSelect }: { title: string, options: string[], selected: string, onSelect: (opt: string) => void }) => {
  return (
    <div className="mb-4 bg-gradient-to-b from-[#2a4365] to-[#1e3a5f] dark:from-slate-800 dark:to-slate-900 rounded-xl border border-blue-400/30 dark:border-slate-700 overflow-hidden shadow-lg">
      <div className="bg-[#1e293b]/50 dark:bg-slate-800/50 p-2.5 flex justify-between items-center text-blue-100 dark:text-slate-200 text-sm font-bold border-b border-blue-400/20 dark:border-slate-700">
        {title}
        <ChevronDown size={16} className="text-blue-300 dark:text-slate-400" />
      </div>
      <div className="p-1.5 flex flex-col gap-1">
        {options.map(opt => (
          <div
            key={opt}
            onClick={() => onSelect(opt)}
            className={cn(
              "px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all flex items-center justify-between",
              selected === opt
                ? "bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-white shadow-md"
                : "text-blue-100 hover:bg-white/10 dark:text-slate-300 dark:hover:bg-slate-700/50"
            )}
          >
            {opt}
            {selected === opt && <Check size={14} className="text-white" />}
          </div>
        ))}
      </div>
    </div>
  );
};

const KpiModal = ({ kpiId, title, onClose }: any) => {
  // Generate some dummy historical data based on kpiId
  const data = Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    value: Math.floor(Math.random() * 50) + 50
  }));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title} - Historical Data</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.15} vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#3b82f6', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ id, title, value, defaultIconName, trend, subtitle, prefs, onUpdatePref, onClick, isSelected }: any) => {
  const [showSettings, setShowSettings] = useState(false);
  const Icon = iconMap[prefs?.icon || defaultIconName] || iconMap.Activity;
  const bgClass = prefs?.color || 'from-white/95 to-blue-50/95 dark:from-slate-800/95 dark:to-slate-900/95';

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      animate={{ 
        scale: isSelected ? 1.05 : 1,
        y: isSelected ? -5 : 0
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "bg-gradient-to-b backdrop-blur-md rounded-2xl border p-3 flex flex-col items-center justify-between relative h-32 group cursor-pointer", 
        bgClass,
        isSelected 
          ? "border-blue-400 dark:border-blue-500 ring-4 ring-blue-400/50 dark:ring-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.5)] z-50" 
          : "border-white dark:border-slate-700 shadow-[0_8px_20px_rgba(0,0,0,0.08)] z-10"
      )}
      onMouseLeave={() => setShowSettings(false)}
      onClick={onClick}
    >
      <button 
        onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }} 
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 z-20"
        aria-label="Customize KPI"
      >
        <Settings size={16} />
      </button>

      {showSettings && (
        <div 
          className="absolute top-8 right-2 bg-white dark:bg-slate-800 shadow-xl rounded-xl p-3 z-30 border border-slate-100 dark:border-slate-700 flex flex-col gap-3 w-48"
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1.5">Theme</div>
            <div className="flex gap-1.5 flex-wrap">
              {colorOptions.map(c => (
                <div 
                  key={c.name} 
                  onClick={() => onUpdatePref(id, { ...prefs, color: c.class })} 
                  className={cn("w-6 h-6 rounded-full cursor-pointer border-2 transition-transform hover:scale-110 bg-gradient-to-b", c.class, prefs?.color === c.class ? "border-blue-500 dark:border-blue-400" : "border-slate-200 dark:border-slate-600")}
                  title={c.name}
                />
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1.5">Icon</div>
            <div className="flex gap-2 flex-wrap">
              {Object.keys(iconMap).map(k => {
                const Ico = iconMap[k];
                const isSelected = (prefs?.icon || defaultIconName) === k;
                return (
                  <div 
                    key={k} 
                    onClick={() => onUpdatePref(id, { ...prefs, icon: k })}
                    className={cn("p-1.5 rounded-lg cursor-pointer transition-colors", isSelected ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700")}
                    title={k}
                  >
                    <Ico size={16} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <h3 className="text-slate-600 dark:text-slate-300 text-sm font-bold text-center w-full">{title}</h3>
      <div className="flex items-baseline gap-1 my-auto">
        <span className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">{value}</span>
        {subtitle && <span className="text-slate-500 dark:text-slate-400 text-sm font-bold">{subtitle}</span>}
      </div>
      <div className="text-teal-600/80 dark:text-teal-400/80">
        <Icon size={22} strokeWidth={2.5} />
      </div>
      {trend && (
        <div className="absolute bottom-3 right-3 flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
          {trend} <TrendingUp size={14} />
        </div>
      )}
    </motion.div>
  );
};

const TasksWidget = ({ tasks, onUpdatePriority }: any) => {
  return (
    <div className="col-span-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-white dark:border-slate-700 shadow-xl p-5 flex flex-col relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-800 dark:text-slate-100 text-lg font-bold flex items-center gap-2">
          <ListTodo size={20} className="text-blue-500" /> Action Items
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tasks.map((task: any) => (
          <div key={task.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", 
                task.priority === 'high' ? 'bg-red-500 shadow-red-500/50' : 
                task.priority === 'medium' ? 'bg-amber-500 shadow-amber-500/50' : 'bg-emerald-500 shadow-emerald-500/50'
              )} />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{task.title}</span>
            </div>
            <div className="flex items-center gap-3">
              <select 
                value={task.priority}
                onChange={(e) => onUpdatePriority(task.id, e.target.value)}
                className={cn(
                  "text-xs font-bold px-2.5 py-1 rounded-lg border outline-none cursor-pointer text-center transition-colors",
                  task.priority === 'high' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/40' : 
                  task.priority === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/40' : 
                  'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                )}
              >
                <option value="high" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">High Priority</option>
                <option value="medium" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">Medium Priority</option>
                <option value="low" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">Low Priority</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [selectedMonth, setSelectedMonth] = useState('Feb');
  const [selectedDept, setSelectedDept] = useState('Stevedoring');
  const [selectedYear, setSelectedYear] = useState('2025');

  const [tasks, setTasks] = useState([
    { id: 1, title: 'Inspect STS Crane 4 for scheduled maintenance', priority: 'high' },
    { id: 2, title: 'Review Gate 2 Maintenance Log', priority: 'medium' },
    { id: 3, title: 'Update Shift B Roster', priority: 'low' },
    { id: 4, title: 'Clear Berth 3 for incoming vessel (MSC Isabella)', priority: 'high' },
  ]);

  const handleUpdateTaskPriority = (taskId: number, newPriority: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, priority: newPriority } : t));
  };

  const [radarData, setRadarData] = useState<any[]>([]);
  const [composedData, setComposedData] = useState<any[]>([]);
  const [dwellData, setDwellData] = useState<any[]>([]);
  const [fleetData, setFleetData] = useState<any[]>([]);
  const [gateData, setGateData] = useState<any[]>([]);
  const [kpiData, setKpiData] = useState({
    craneMov: '36.5',
    berthOccupancy: '88.2%',
    gateCycle: '1.15',
    ltiFree: 425,
    dwellTime: '4.8',
    teuVolume: '1,250,000',
    teuTrend: '+2.8%',
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [kpiPrefs, setKpiPrefs] = useState<Record<string, any>>({});
  const [selectedKpi, setSelectedKpi] = useState<{ id: string, title: string } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleUpdatePref = (id: string, newPrefs: any) => {
    setKpiPrefs(prev => ({ ...prev, [id]: newPrefs }));
  };

  useEffect(() => {
    socket.on('connect', () => {
      setConnectionError(null);
    });

    socket.on('connect_error', (err) => {
      setConnectionError("Failed to connect to real-time data server.");
    });

    socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        socket.connect();
      }
      setConnectionError("Connection lost. Attempting to reconnect...");
    });

    socket.on('dashboard_data', (data) => {
      setRadarData(data.radarData);
      setComposedData(data.composedData);
      setDwellData(data.dwellData);
      setFleetData(data.fleetData);
      setGateData(data.gateData);
      setKpiData(data.kpiData);
      setIsRefreshing(false);
      setConnectionError(null);
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
      socket.off('dashboard_data');
    };
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    socket.emit('request_refresh');
  };

  if (radarData.length === 0 && !connectionError) {
    return <div className="min-h-screen bg-[#dce6f2] dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xl">Loading Real-Time Data...</div>;
  }

  return (
    <div className="min-h-screen bg-[#dce6f2] dark:bg-slate-900 p-6 font-sans relative overflow-hidden flex flex-col transition-colors duration-300">
      {/* KPI Modal */}
      {selectedKpi && (
        <KpiModal 
          kpiId={selectedKpi.id} 
          title={selectedKpi.title} 
          onClose={() => setSelectedKpi(null)} 
        />
      )}

      {/* Error Banner */}
      {connectionError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-4">
          <AlertCircle size={20} />
          <span className="font-medium">{connectionError}</span>
          <button onClick={() => socket.connect()} className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm font-bold transition-colors">
            Retry
          </button>
        </div>
      )}

      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 dark:from-slate-800/40 via-transparent to-transparent pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center justify-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-3 shadow-md border border-white/50 dark:border-slate-700/50 w-48 h-20">
            <img src="https://i.ibb.co/jPHJHgWr/DP-World-2021-logo.jpg" alt="DP World Logo" className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal dark:invert" />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none mb-1">DP WORLD JEBEL ALI</h1>
            <h2 className="text-2xl font-bold text-slate-600 dark:text-slate-400 tracking-widest leading-none">CONTAINER TERMINAL DASHBOARD</h2>
          </div>
        </div>
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-white dark:border-slate-700 shadow-lg px-6 py-4 rounded-2xl flex items-center gap-3 text-base font-bold text-slate-600 dark:text-slate-300">
          Berth Occupancy improved <span className="text-emerald-600 dark:text-emerald-400 text-lg">-1.1%</span> vs last month <TrendingUp size={24} className="text-emerald-600 dark:text-emerald-400" />
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-2"></div>
          
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={cn(isRefreshing && "animate-spin")} />
            Refresh
          </button>
        </div>
      </header>

      <div className="relative z-10 flex gap-6 flex-1">
        {/* Sidebar */}
        <div className="w-56 shrink-0 flex flex-col gap-5">
          <FilterGroup 
            title="Month" 
            options={['Jan', 'Feb', 'Mar']} 
            selected={selectedMonth} 
            onSelect={(val) => { setSelectedMonth(val); handleRefresh(); }} 
          />
          <FilterGroup 
            title="Department" 
            options={['Stevedoring', 'Gate Ops', 'Yard Ops', 'Engineering']} 
            selected={selectedDept} 
            onSelect={(val) => { setSelectedDept(val); handleRefresh(); }} 
          />
          <FilterGroup 
            title="Year" 
            options={['2023', '2024', '2025']} 
            selected={selectedYear} 
            onSelect={(val) => { setSelectedYear(val); handleRefresh(); }} 
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6 relative">
          {/* Loading Overlay */}
          {isRefreshing && (
            <div className="absolute -inset-4 z-50 flex items-center justify-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm rounded-3xl transition-all">
              <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-6 py-4 rounded-xl shadow-2xl border border-blue-100 dark:border-slate-700">
                <RefreshCw className="animate-spin text-blue-500" size={24} />
                <span className="text-slate-700 dark:text-slate-200 font-bold">Syncing Data...</span>
              </div>
            </div>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-6 gap-4">
            <KPICard id="craneMov" title="Crane Mov/hr" value={kpiData.craneMov} defaultIconName="Crane" prefs={kpiPrefs['craneMov']} onUpdatePref={handleUpdatePref} onClick={() => setSelectedKpi({ id: 'craneMov', title: 'Crane Mov/hr' })} isSelected={selectedKpi?.id === 'craneMov'} />
            <KPICard id="berthOccup" title="Berth Occup." value={kpiData.berthOccupancy} defaultIconName="Ship" prefs={kpiPrefs['berthOccup']} onUpdatePref={handleUpdatePref} onClick={() => setSelectedKpi({ id: 'berthOccup', title: 'Berth Occup.' })} isSelected={selectedKpi?.id === 'berthOccup'} />
            <KPICard id="gateCycle" title="Gate Cycle" value={kpiData.gateCycle} subtitle="hrs" defaultIconName="Truck" prefs={kpiPrefs['gateCycle']} onUpdatePref={handleUpdatePref} onClick={() => setSelectedKpi({ id: 'gateCycle', title: 'Gate Cycle' })} isSelected={selectedKpi?.id === 'gateCycle'} />
            <KPICard id="ltiFree" title="LTI-Free Days" value={kpiData.ltiFree} defaultIconName="HardHat" prefs={kpiPrefs['ltiFree']} onUpdatePref={handleUpdatePref} onClick={() => setSelectedKpi({ id: 'ltiFree', title: 'LTI-Free Days' })} isSelected={selectedKpi?.id === 'ltiFree'} />
            <KPICard id="dwellTime" title="Dwell Time" value={kpiData.dwellTime} subtitle="days" defaultIconName="Package" prefs={kpiPrefs['dwellTime']} onUpdatePref={handleUpdatePref} onClick={() => setSelectedKpi({ id: 'dwellTime', title: 'Dwell Time' })} isSelected={selectedKpi?.id === 'dwellTime'} />
            <KPICard id="teuVol" title="TEU Volume" value={kpiData.teuVolume} trend={kpiData.teuTrend} defaultIconName="Activity" prefs={kpiPrefs['teuVol']} onUpdatePref={handleUpdatePref} onClick={() => setSelectedKpi({ id: 'teuVol', title: 'TEU Volume' })} isSelected={selectedKpi?.id === 'teuVol'} />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-12 gap-5 flex-1">
            {/* Top Row */}
            <div className="col-span-5 bg-gradient-to-br from-[#1b2b42] to-[#0f172a] rounded-2xl border border-blue-400/20 shadow-2xl p-5 flex flex-col relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoNTksIDEzMCwgMjQ2LCAwLjA1KSIvPjwvc3ZnPg==')] pointer-events-none"></div>
              <h3 className="text-center text-blue-100 text-sm font-semibold mb-2 relative z-10">Efficiency by Shift</h3>
              <div className="flex-1 relative z-10 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid gridType="polygon" stroke="#3b82f6" strokeOpacity={0.4} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#93c5fd', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#3b82f6', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#93c5fd' }} />
                    <Radar name="Efficiency" dataKey="A" stroke="#7dd3fc" strokeWidth={2} fill="#38bdf8" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-span-7 bg-gradient-to-br from-[#1b2b42] to-[#0f172a] rounded-2xl border border-blue-400/20 shadow-2xl p-5 flex flex-col relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoNTksIDEzMCwgMjQ2LCAwLjA1KSIvPjwvc3ZnPg==')] pointer-events-none"></div>
              <h3 className="text-center text-blue-100 text-sm font-semibold mb-2 relative z-10">TEU Volume and Vessel Calls by Month</h3>
              <div className="flex-1 relative z-10 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={composedData} margin={{ top: 20, right: 20, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3b82f6" strokeOpacity={0.15} vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#93c5fd', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fill: '#93c5fd', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}M`} domain={[0, 1.5]} ticks={[0, 0.3, 0.6, 0.9, 1.2, 1.5]} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: '#93c5fd', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 12]} ticks={[0, 2, 4, 6, 8, 10, 12]} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#3b82f6', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#93c5fd', paddingTop: '10px' }} iconType="circle" />
                    <Brush dataKey="name" height={20} stroke="#3b82f6" fill="#0f172a" tickFormatter={() => ''} />
                    <Bar yAxisId="left" dataKey="teu" name="TEU Volume" fill="url(#colorTeu)" barSize={40} radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="teu" position="top" fill="#e0f2fe" fontSize={11} formatter={(v: number) => `${v}M`} />
                    </Bar>
                    <Line yAxisId="right" type="monotone" dataKey="calls" name="Vessel Calls" stroke="#7dd3fc" strokeWidth={3} dot={{ r: 5, fill: '#0f172a', stroke: '#7dd3fc', strokeWidth: 2 }} activeDot={{ r: 7, fill: '#fff', stroke: '#7dd3fc' }}>
                       <LabelList dataKey="calls" position="top" fill="#e0f2fe" fontSize={11} offset={10} />
                    </Line>
                    <defs>
                      <linearGradient id="colorTeu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#0284c7" stopOpacity={0.4}/>
                      </linearGradient>
                    </defs>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="col-span-3 bg-gradient-to-br from-[#1b2b42] to-[#0f172a] rounded-2xl border border-blue-400/20 shadow-2xl p-5 flex flex-col items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoNTksIDEzMCwgMjQ2LCAwLjA1KSIvPjwvc3ZnPg==')] pointer-events-none"></div>
              <h3 className="text-center text-blue-100 text-sm font-semibold mb-2 relative z-10">Vessel Dwell Split</h3>
              <div className="flex-1 w-full relative z-10 min-h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#3b82f6', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 11, color: '#93c5fd' }} />
                    <Pie
                      data={dwellData}
                      cx="50%"
                      cy="45%"
                      innerRadius="60%"
                      outerRadius="80%"
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      nameKey="name"
                      stroke="none"
                    >
                      {dwellData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                  <span className="text-white font-bold text-xl tracking-tight">&lt;3 Days</span>
                  <span className="text-blue-200 text-sm font-semibold flex items-center gap-1 mt-1">
                    <div className="w-2.5 h-2.5 bg-[#4ade80] rounded-sm"></div> {dwellData[0]?.value}%
                  </span>
                </div>
              </div>
            </div>

            <div className="col-span-6 bg-gradient-to-br from-[#1b2b42] to-[#0f172a] rounded-2xl border border-blue-400/20 shadow-2xl p-5 flex flex-col relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoNTksIDEzMCwgMjQ2LCAwLjA1KSIvPjwvc3ZnPg==')] pointer-events-none"></div>
              <h3 className="text-center text-blue-100 text-sm font-semibold mb-2 relative z-10">TEU Volume By Crane Fleet</h3>
              <div className="flex-1 relative z-10 min-h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fleetData} layout="vertical" margin={{ top: 10, right: 60, left: 40, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3b82f6" strokeOpacity={0.1} horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#93c5fd', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 300000]} ticks={[0, 50000, 100000, 150000, 200000, 250000, 300000]} tickFormatter={(v) => v.toLocaleString()} />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#93c5fd', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#3b82f6', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                    <Bar dataKey="value" fill="url(#colorFleet)" barSize={16} radius={[0, 4, 4, 0]}>
                       <LabelList dataKey="value" position="right" fill="#e0f2fe" fontSize={11} formatter={(v: number) => v.toLocaleString()} />
                    </Bar>
                    <defs>
                      <linearGradient id="colorFleet" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#166534" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#4ade80" stopOpacity={1}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-span-3 bg-gradient-to-br from-[#1b2b42] to-[#0f172a] rounded-2xl border border-blue-400/20 shadow-2xl p-5 flex flex-col items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoNTksIDEzMCwgMjQ2LCAwLjA1KSIvPjwvc3ZnPg==')] pointer-events-none"></div>
              <h3 className="text-center text-blue-100 text-sm font-semibold mb-2 relative z-10">Gate Status - Lane Availability</h3>
              <div className="flex-1 w-full relative z-10 min-h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#3b82f6', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 11, color: '#93c5fd' }} />
                    <Pie
                      data={gateData}
                      cx="50%"
                      cy="45%"
                      innerRadius="65%"
                      outerRadius="80%"
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      nameKey="name"
                      stroke="none"
                    >
                      {gateData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                  <span className="text-white font-black text-3xl tracking-tight">{gateData[0]?.value}%</span>
                  <span className="text-emerald-400 text-xs font-bold flex items-center gap-0.5 mt-1"><TrendingUp size={14}/> {gateData[0]?.value}%</span>
                </div>
              </div>
            </div>

            {/* Tasks Widget */}
            <TasksWidget tasks={tasks} onUpdatePriority={handleUpdateTaskPriority} />
          </div>
        </div>
      </div>
    </div>
  );
}

