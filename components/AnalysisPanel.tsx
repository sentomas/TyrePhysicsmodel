import React, { useState } from 'react';
import { TyreModelData, AnalysisResult } from '../types';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { BarChart3, ScanEye, Activity, Droplets, Flame, Disc, TrendingDown, SlidersHorizontal, Info } from 'lucide-react';
import { MIN_TREAD_DEPTH } from '../constants';

interface Props {
  history: TyreModelData[];
  lastAnalysis: AnalysisResult | null;
}

export const AnalysisPanel: React.FC<Props> = ({ history, lastAnalysis }) => {
  // Local state for forecast calibration
  const [calibrationFactor, setCalibrationFactor] = useState(1.0);

  // Format history for chart
  const chartData = history.map((d, i) => ({
    time: i,
    wax: d.waxReserve,
    bloom: d.surfaceBloom,
    oxidation: d.oxidationLevel,
    tread: d.treadDepth
  }));

  const current = history[history.length - 1] || { waxReserve: 0, surfaceBloom: 0, oxidationLevel: 0, treadDepth: 8.0 };
  const previous = history[history.length - 2] || current;

  // Calculate EOL based on current tread and calibration
  const baseRangeMultiplier = 200; // Base km per mm
  const projectedRange = current.treadDepth > MIN_TREAD_DEPTH 
    ? Math.floor((current.treadDepth - MIN_TREAD_DEPTH) * baseRangeMultiplier * calibrationFactor)
    : 0;

  // Calculate dynamic wear rate (Instantaneous)
  // This avoids issues where initialTreadDepth != 8 causes massive artificial wear rate in the previous (8 - current) / time calculation
  const instantaneousWear = Math.abs(previous.treadDepth - current.treadDepth);
  // Smooth it slightly if history exists, or use instantaneous
  const wearRateDisplay = history.length > 5 
    ? (history[history.length - 5].treadDepth - current.treadDepth) / 5 
    : instantaneousWear;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Main Telemetry Panel */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-teal-400" /> Lifecycle Telemetry
        </h3>

        {/* Telemetry Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
               <Activity className="w-3 h-3" />
               <span className="text-xs font-bold uppercase">Wax Reserve</span>
            </div>
            <div className="text-2xl font-mono text-white">{current.waxReserve.toFixed(1)}%</div>
          </div>

          <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 text-yellow-400 mb-1">
               <Droplets className="w-3 h-3" />
               <span className="text-xs font-bold uppercase">Bloom</span>
            </div>
            <div className="text-2xl font-mono text-white">{current.surfaceBloom.toFixed(1)}%</div>
          </div>

          <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 text-orange-400 mb-1">
               <Flame className="w-3 h-3" />
               <span className="text-xs font-bold uppercase">Oxidation</span>
            </div>
            <div className="text-2xl font-mono text-white">{current.oxidationLevel.toFixed(1)}%</div>
          </div>
        </div>

        <div className="h-64 mb-6 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" hide />
              <YAxis domain={[0, 100]} stroke="#475569" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
                itemStyle={{ fontSize: '12px', color: '#fff' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="wax" stroke="#10b981" strokeWidth={2} dot={false} name="Wax Reserve" animationDuration={500} />
              <Line type="monotone" dataKey="bloom" stroke="#eab308" strokeWidth={2} dot={false} name="Surface Bloom" animationDuration={500} />
              <Line type="monotone" dataKey="oxidation" stroke="#f97316" strokeWidth={2} dot={false} name="Oxidation" animationDuration={500} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {lastAnalysis ? (
           <div className="border-t border-slate-800 pt-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-2 mb-3 text-indigo-400 font-medium">
                 <ScanEye className="w-4 h-4" /> Latest Vision Inspection
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                 <div className="bg-slate-950 p-3 rounded-lg">
                    <span className="block text-slate-500 text-xs uppercase mb-1">Detected Hue</span>
                    <span className="text-white font-mono break-words">{lastAnalysis.hueColor}</span>
                 </div>
                 <div className="bg-slate-950 p-3 rounded-lg md:col-span-2">
                    <span className="block text-slate-500 text-xs uppercase mb-1">Surface Condition</span>
                    <p className="text-white font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {lastAnalysis.condition}
                    </p>
                 </div>
              </div>
           </div>
        ) : (
          <div className="border-t border-slate-800 pt-4 text-center text-slate-500 text-sm py-4">
            No visual inspection data available. Upload an image to calibrate.
          </div>
        )}
      </div>

      {/* Tread Depth Specific Chart */}
      <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-cyan-400" /> Tread Wear Forecast
        </h3>

        <div className="flex items-end gap-2 mb-6">
          <div className="text-4xl font-mono font-bold text-white tracking-tighter">
            {current.treadDepth.toFixed(2)}
          </div>
          <div className="text-sm text-slate-400 mb-1">mm remaining</div>
        </div>

        <div className="flex-1 min-h-[180px] w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorTread" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" hide />
              <YAxis domain={[0, 'auto']} stroke="#475569" fontSize={10} unit="mm" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
                itemStyle={{ fontSize: '12px', color: '#fff' }}
                formatter={(value: number) => [`${value.toFixed(2)} mm`, 'Tread Depth']}
              />
              <ReferenceLine y={MIN_TREAD_DEPTH} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Legal Limit', fill: '#ef4444', fontSize: 10 }} />
              <Area 
                type="monotone" 
                dataKey="tread" 
                stroke="#06b6d4" 
                fillOpacity={1} 
                fill="url(#colorTread)" 
                animationDuration={500}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-auto p-3 bg-slate-950/50 rounded-lg border border-slate-800 text-xs space-y-3">
           <div className="flex justify-between items-center group relative">
             <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Avg. Wear Rate</span>
                <Info className="w-3 h-3 text-slate-500 cursor-help" />
                
                {/* Tooltip for explanation */}
                <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-800 text-slate-200 text-[10px] rounded shadow-xl border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  Calculated based on mm lost per simulation tick (approx 0.5s). High speed, temp, and soft compounds increase this rate.
                </div>
             </div>
             <span className="text-cyan-400 font-mono">{wearRateDisplay.toFixed(4)} mm/tick</span>
           </div>
           
           {/* Interactive Calibration Control */}
           <div className="space-y-2 border-t border-slate-800 pt-2">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-1.5 text-indigo-400">
                    <SlidersHorizontal className="w-3 h-3" />
                    <span className="font-semibold">Forecast Calibration</span>
                 </div>
                 <span className="text-slate-500 font-mono">x{calibrationFactor.toFixed(1)}</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="2.0" 
                step="0.1" 
                value={calibrationFactor}
                onChange={(e) => setCalibrationFactor(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
           </div>

           <div className="flex justify-between items-center pt-1">
             <span className="text-slate-300 font-medium">Projected EOL</span>
             <span className={`font-mono text-sm font-bold ${current.treadDepth > MIN_TREAD_DEPTH ? 'text-white' : 'text-red-500'}`}>
               {current.treadDepth > MIN_TREAD_DEPTH 
                 ? `${projectedRange.toLocaleString()} km` 
                 : 'CRITICAL'}
             </span>
           </div>
        </div>
      </div>

    </div>
  );
};