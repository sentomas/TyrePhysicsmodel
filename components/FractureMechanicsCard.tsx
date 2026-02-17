import React from 'react';
import { TyreModelData, SimulationParams } from '../types';
import { GitBranch, Zap, ShieldAlert, Activity, Microscope } from 'lucide-react';

interface Props {
  data: TyreModelData;
  params: SimulationParams;
}

export const FractureMechanicsCard: React.FC<Props> = ({ data, params }) => {
  // --- Physics Derived Metrics ---
  
  // 1. Brittleness Index (0 to 1)
  // Increases as wax depletes and oxidation rises.
  // Wax provides plasticity. Oxidation Cross-linking causes brittleness.
  const brittleness = Math.min(1, (data.oxidationLevel / 100) * 0.7 + ((100 - data.waxReserve) / 100) * 0.3);

  // 2. Critical Energy Release Rate (Gc) - "Toughness"
  // High for healthy rubber, Low for dry rot.
  // Healthy rubber ~10 kJ/m^2. Dry rot ~0.5 kJ/m^2.
  const toughnessGc = 10 * (1 - brittleness); 

  // 3. Crack Propagation Rate (da/dN) - Paris Law approximation
  // Proportional to Stress (Speed/Flex) and inverse of Toughness.
  // Only applies if moving.
  const stressIntensity = params.isMoving ? (params.speed / 50) : 0.1;
  const crackGrowthRate = params.isMoving 
    ? (stressIntensity ** 4) / Math.max(0.1, toughnessGc) 
    : 0;

  // 4. State Classification
  let materialState = 'Elastic (Ductile)';
  let stateColor = 'text-emerald-400';
  let crackColor = '#10b981'; // Emerald

  if (brittleness > 0.4 && brittleness <= 0.7) {
    materialState = 'Viscoelastic (Transition)';
    stateColor = 'text-yellow-400';
    crackColor = '#facc15'; // Yellow
  } else if (brittleness > 0.7) {
    materialState = 'Brittle (Glassy)';
    stateColor = 'text-red-500';
    crackColor = '#ef4444'; // Red
  }

  // --- Generative Crack Visualization ---
  // Generate SVG path based on integrity loss
  const integrityLoss = 100 - data.structuralIntegrity;
  const crackDepth = (integrityLoss / 100) * 80; // Max 80% depth visually

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col h-full relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="p-2 bg-red-950/30 rounded-lg border border-red-500/20">
          <GitBranch className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Fracture Mechanics</h3>
          <p className="text-xs text-slate-400">Dry Rot & Crack Propagation Model</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        
        {/* Left: Visual Crack Simulation */}
        <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center min-h-[160px]">
           <div className="relative w-full h-32 bg-slate-900 rounded border border-slate-800 overflow-hidden">
              {/* Rubber Material Base */}
              <div className="absolute inset-0 bg-[#1a1a1a] opacity-80"></div>
              
              {/* Grain / Noise Texture */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '4px 4px' }}></div>

              {/* Crack Drawing */}
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                 {/* Main Surface Line */}
                 <line x1="0" y1="2" x2="100%" y2="2" stroke="#475569" strokeWidth="4" />

                 {/* Dynamic Crack 1 */}
                 {integrityLoss > 10 && (
                   <path 
                     d={`M 20 2 L 25 ${10 + crackDepth * 0.5} L 15 ${20 + crackDepth * 0.8} L 22 ${30 + crackDepth}`} 
                     fill="none" 
                     stroke={crackColor} 
                     strokeWidth="2" 
                     strokeLinecap="round"
                     className="animate-pulse"
                     style={{ animationDuration: '3s' }}
                   />
                 )}
                 
                 {/* Dynamic Crack 2 (Major) */}
                 {integrityLoss > 30 && (
                   <path 
                     d={`M 60 2 L 55 ${15 + crackDepth * 0.6} L 65 ${35 + crackDepth * 0.9} L 58 ${50 + crackDepth}`} 
                     fill="none" 
                     stroke={crackColor} 
                     strokeWidth={Math.max(2, integrityLoss / 10)} 
                     strokeLinecap="round"
                   />
                 )}

                  {/* Micro Fissures */}
                  {integrityLoss > 50 && (
                    <>
                     <path d="M 40 2 L 42 15" stroke={crackColor} strokeWidth="1" opacity="0.5" />
                     <path d="M 80 2 L 78 12" stroke={crackColor} strokeWidth="1" opacity="0.5" />
                     <path d="M 90 2 L 92 18" stroke={crackColor} strokeWidth="1" opacity="0.5" />
                    </>
                  )}
              </svg>

              {/* Label */}
              <div className="absolute bottom-2 right-2 text-[10px] font-mono text-slate-500">
                CROSS-SECTION
              </div>
           </div>
           
           <div className="mt-3 flex items-center justify-between w-full">
              <span className="text-xs text-slate-400">Integrity Loss</span>
              <span className={`text-sm font-mono font-bold ${integrityLoss > 40 ? 'text-red-500' : 'text-slate-200'}`}>
                {integrityLoss.toFixed(1)}%
              </span>
           </div>
        </div>

        {/* Right: Physics Metrics */}
        <div className="space-y-4">
           
           {/* Metric 1: Toughness */}
           <div>
              <div className="flex justify-between items-center mb-1">
                 <div className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3 h-3 text-indigo-400" />
                    <span className="text-xs font-semibold text-slate-300">Fracture Toughness ($G_c$)</span>
                 </div>
                 <span className="text-xs font-mono text-indigo-300">{toughnessGc.toFixed(2)} kJ/m²</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-indigo-500 transition-all duration-500"
                   style={{ width: `${(toughnessGc / 10) * 100}%` }}
                 ></div>
              </div>
           </div>

           {/* Metric 2: Crack Growth Rate */}
           <div>
              <div className="flex justify-between items-center mb-1">
                 <div className="flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-orange-400" />
                    <span className="text-xs font-semibold text-slate-300">Growth Rate ($da/dN$)</span>
                 </div>
                 <span className="text-xs font-mono text-orange-300">{crackGrowthRate.toFixed(4)} mm/cyc</span>
              </div>
              {/* Logarithmic scale viz */}
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                 {Array.from({ length: 10 }).map((_, i) => (
                    <div 
                      key={i}
                      className={`h-full flex-1 rounded-sm ${i / 10 < crackGrowthRate * 2 ? 'bg-orange-500' : 'bg-slate-700'}`}
                    ></div>
                 ))}
              </div>
           </div>

           {/* Metric 3: Material State */}
           <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                 <Microscope className="w-3 h-3 text-slate-400" />
                 <span className="text-xs uppercase tracking-wider text-slate-500">Polymer Phase</span>
              </div>
              <div className={`text-sm font-mono font-bold border border-slate-700 bg-slate-950/80 p-2 rounded text-center ${stateColor}`}>
                 {materialState}
              </div>
           </div>

        </div>
      </div>

      {/* Physics Footer */}
      <div className="mt-auto pt-4 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex justify-between">
         <span>Model: Paris-Erdogan Law</span>
         <span>Factor: {brittleness.toFixed(2)} (Brittleness)</span>
      </div>

      {/* Background Effect */}
      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-red-500/5 blur-[80px] rounded-full pointer-events-none"></div>
    </div>
  );
};