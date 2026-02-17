import React, { useState } from 'react';
import { TyreModelData, TyreState, TyreProperties } from '../types';
import { Activity, CalendarClock, Route, Disc, ChevronDown, ChevronUp, AlertTriangle, Fingerprint, Layers, Beaker, Clock, Award } from 'lucide-react';

interface Props {
  data: TyreModelData;
  properties?: TyreProperties;
}

export const TyreHealthCard: React.FC<Props> = ({ data, properties }) => {
  const [showSpecs, setShowSpecs] = useState(false);

  // Determine visual styles based on state
  const getStateConfig = (state: TyreState) => {
    switch (state) {
      case TyreState.MINT:
        return {
          title: 'Mint Condition',
          status: 'Optimal Protection',
          description: 'Protective bloom barrier is intact.',
          color: 'text-emerald-400',
          bg: 'bg-emerald-950/30',
          border: 'border-emerald-500/50',
          tireTint: 'bg-gradient-to-br from-[#2a3028] to-[#1a1a1a]', // Green/Brown hint
          bloomOpacity: 0.8
        };
      case TyreState.ACTIVE:
        return {
          title: 'Active Service',
          status: 'Self-Maintenance',
          description: 'Driving action shedding oxidized layers.',
          color: 'text-blue-400',
          bg: 'bg-blue-950/30',
          border: 'border-blue-500/50',
          tireTint: 'bg-[#111111]', // Deep Black
          bloomOpacity: 0.1
        };
      case TyreState.WARNING:
        return {
          title: 'Warning',
          status: 'Check Tyre',
          description: 'Wax reservoir depleted or Tread low.',
          color: 'text-amber-400',
          bg: 'bg-amber-950/30',
          border: 'border-amber-500/50',
          tireTint: 'bg-slate-700', // Faded Grey
          bloomOpacity: 0
        };
      case TyreState.CRITICAL:
        return {
          title: 'Critical',
          status: 'Integrity Failure',
          description: 'Cracks detected or Tread illegal.',
          color: 'text-red-500',
          bg: 'bg-red-950/30',
          border: 'border-red-500/50',
          tireTint: 'bg-slate-600',
          bloomOpacity: 0
        };
    }
  };

  const config = getStateConfig(data.state);

  // RUL Calculation Breakdown
  const maxRul = 1100;
  const rulPercentage = Math.min(100, Math.max(0, (data.rul / maxRul) * 100));
  
  // Tread percentage
  const initialTread = properties?.initialTreadDepth || 8.0;
  const treadPercentage = Math.min(100, Math.max(0, (data.treadDepth / initialTread) * 100));

  // Dry Rot / Integrity Loss
  const dryRotPercentage = Math.max(0, 100 - data.structuralIntegrity);
  
  return (
    <div className={`relative overflow-hidden rounded-2xl border ${config.border} bg-slate-900 shadow-2xl transition-all duration-500 flex flex-col h-full`}>
      {/* Background Gradient / Glow */}
      <div className={`absolute inset-0 opacity-20 ${config.bg} blur-3xl`} />

      <div className="relative p-6 z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${config.border} ${config.bg} ${config.color} mb-2`}>
              <Activity className="w-3 h-3" />
              {data.state}
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">{config.title}</h2>
            <p className="text-slate-400 text-sm mt-1">{config.status}</p>
          </div>
          
          {/* Odometer Display */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">
              <Route className="w-3 h-3" /> Odometer
            </div>
            <div className="font-mono text-xl text-white">
              {data.mileage.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-sm text-slate-500">km</span>
            </div>
            {properties?.manufacturerLife && (
               <div className="text-[10px] text-slate-500 mt-0.5">
                  of {properties.manufacturerLife.toLocaleString()} km
               </div>
            )}
          </div>
        </div>

        {/* Visual Tyre Representation (Abstract) */}
        <div className="flex justify-center mb-6">
          <div className={`w-32 h-32 rounded-full shadow-2xl border-4 border-slate-800 flex items-center justify-center relative transition-colors duration-1000 ${config.tireTint}`}>
             {/* Bloom Overlay */}
             <div 
               className="absolute inset-0 rounded-full transition-opacity duration-1000"
               style={{ 
                 background: 'radial-gradient(circle at 30% 30%, rgba(132, 169, 140, 0.4), transparent 70%)',
                 opacity: config.bloomOpacity 
               }}
             />
             
             {/* Tyre Texture Rings */}
             <div className="w-20 h-20 rounded-full border border-white/5 opacity-20" />
             <div className="absolute w-28 h-28 rounded-full border border-white/5 opacity-20" />
             
             {/* Central Hub */}
             <div className="w-12 h-12 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center z-10">
                <span className="text-slate-600 font-bold text-xs">TWIN</span>
             </div>
          </div>
        </div>

        {/* RUL Section - Enhanced */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 mb-6 backdrop-blur-sm">
           <div className="flex items-center justify-between mb-2">
             <div className="flex items-center gap-2 text-indigo-300">
               <CalendarClock className="w-4 h-4" />
               <span className="text-xs font-bold uppercase tracking-wide">Predicted RUL</span>
             </div>
             <div className="text-right">
               <span className="text-xl font-mono font-bold text-white">{data.rul}</span>
               <span className="text-xs text-slate-500 ml-1">days</span>
             </div>
           </div>
           
           {/* Progress Bar */}
           <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
             <div 
               className={`h-full rounded-full transition-all duration-500 ${rulPercentage > 50 ? 'bg-indigo-500' : rulPercentage > 20 ? 'bg-amber-500' : 'bg-red-500'}`}
               style={{ width: `${rulPercentage}%` }} 
             />
           </div>

           {/* RUL Factors */}
           <div className="grid grid-cols-2 gap-2">
             <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded text-xs">
               <span className="text-slate-400">Wax Supply</span>
               <span className={`${data.waxReserve < 30 ? 'text-amber-400' : 'text-slate-200'}`}>{Math.round(data.waxReserve)}%</span>
             </div>
             <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded text-xs">
               <span className="text-slate-400">Integrity</span>
               <span className={`${data.structuralIntegrity < 50 ? 'text-red-400' : 'text-slate-200'}`}>{Math.round(data.structuralIntegrity)}%</span>
             </div>
           </div>
        </div>

        {/* Metrics Grid (2x2) */}
        <div className="grid grid-cols-2 gap-3 mb-4">
           {/* Bloom */}
           <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800">
              <div className="flex justify-between text-xs mb-1 text-slate-400">
                <span>Bloom</span>
                <span className="text-slate-200 font-mono font-bold">{Math.round(data.surfaceBloom)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${data.state === TyreState.MINT ? 'bg-yellow-600' : 'bg-slate-500'}`} 
                  style={{ width: `${data.surfaceBloom}%` }}
                />
              </div>
           </div>
           
           {/* Oxidation */}
           <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800">
              <div className="flex justify-between text-xs mb-1 text-slate-400">
                <span>Oxid.</span>
                <span className="text-slate-200 font-mono font-bold">{Math.round(data.oxidationLevel)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                 <div 
                  className="h-full bg-amber-600 transition-all duration-300" 
                  style={{ width: `${data.oxidationLevel}%` }}
                />
              </div>
           </div>

           {/* Tread */}
           <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800">
              <div className="flex justify-between text-xs mb-1 text-slate-400">
                <span className="flex items-center gap-1"><Disc className="w-3 h-3"/> Tread</span>
                <span className={`${data.treadDepth < 3 ? 'text-red-400' : 'text-slate-200'} font-mono font-bold`}>
                  {data.treadDepth.toFixed(1)}mm
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                 <div 
                  className={`h-full transition-all duration-300 ${data.treadDepth < 3 ? 'bg-red-500' : 'bg-blue-500'}`} 
                  style={{ width: `${treadPercentage}%` }}
                />
              </div>
           </div>

           {/* Dry Rot Risk */}
           <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800">
              <div className="flex justify-between text-xs mb-1 text-slate-400">
                <span className="flex items-center gap-1"><Fingerprint className="w-3 h-3"/> Dry Rot</span>
                <span className={`${dryRotPercentage > 30 ? 'text-red-400' : 'text-slate-200'} font-mono font-bold`}>
                  {Math.round(dryRotPercentage)}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                 <div 
                  className={`h-full transition-all duration-300 ${dryRotPercentage > 50 ? 'bg-red-600' : 'bg-slate-600'}`} 
                  style={{ width: `${dryRotPercentage}%` }}
                />
              </div>
           </div>
        </div>

        {/* Collapsible Specs Section */}
        {properties && (
          <div className="mt-auto border-t border-slate-800 pt-3">
             <button 
              onClick={() => setShowSpecs(!showSpecs)}
              className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-indigo-400 transition-colors py-1"
             >
                <span className="uppercase font-bold tracking-wider">Tyre Specifications</span>
                {showSpecs ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
             </button>
             
             {showSpecs && (
               <div className="mt-2 grid grid-cols-2 gap-2 text-xs animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="bg-slate-950 p-2 rounded border border-slate-800/50">
                    <div className="flex items-center gap-1 text-slate-400 mb-0.5"><Clock className="w-3 h-3" /> Curing</div>
                    <div className="text-white font-mono">{properties.curingTime}m</div>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800/50">
                    <div className="flex items-center gap-1 text-slate-400 mb-0.5"><Beaker className="w-3 h-3" /> Chemical</div>
                    <div className="text-white font-mono">{properties.antiozonantType}</div>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800/50">
                    <div className="flex items-center gap-1 text-slate-400 mb-0.5"><Layers className="w-3 h-3" /> Compound</div>
                    <div className="text-white font-mono truncate">{properties.rubberCompound.split(' ')[0]}</div>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800/50">
                    <div className="flex items-center gap-1 text-slate-400 mb-0.5"><Award className="w-3 h-3" /> Warranty</div>
                    <div className="text-white font-mono">{(properties.manufacturerLife / 1000).toFixed(0)}k km</div>
                  </div>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};