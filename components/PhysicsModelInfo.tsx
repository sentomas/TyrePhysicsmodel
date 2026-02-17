import React from 'react';
import { Beaker, Wind, Sun, Activity, GitBranch, Disc } from 'lucide-react';

export const PhysicsModelInfo: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
        <div className="p-2 bg-indigo-950/50 rounded-lg border border-indigo-500/20">
          <Beaker className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Physics-Informed Digital Twin</h3>
          <p className="text-xs text-slate-400">Simulation Logic & Material Science Variables</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Logic Block 1 */}
        <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800/50 hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-2 mb-3">
             <div className="w-8 h-8 rounded-full bg-emerald-950 flex items-center justify-center border border-emerald-900">
               <Activity className="w-4 h-4 text-emerald-400" />
             </div>
             <span className="font-semibold text-slate-200 text-sm">The "Blooming" Effect</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Rubber is modeled as a porous medium containing a sacrificial antiozonant wax. The model simulates the <strong>Fickian diffusion</strong> of this wax to the surface.
          </p>
          <div className="text-[10px] font-mono bg-slate-900 p-2 rounded text-slate-500">
            Rate = (Temp - 15°C) * WaxReserve
          </div>
        </div>

        {/* Logic Block 2 */}
        <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800/50 hover:border-slate-700 transition-colors">
           <div className="flex items-center gap-2 mb-3">
             <div className="w-8 h-8 rounded-full bg-orange-950 flex items-center justify-center border border-orange-900">
               <Sun className="w-4 h-4 text-orange-400" />
             </div>
             <span className="font-semibold text-slate-200 text-sm">Oxidation Stressors</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Real-time calculation of UV Index and Ozone concentration. High stress values degrade the rubber polymer chains if surface bloom protection is low.
          </p>
          <div className="text-[10px] font-mono bg-slate-900 p-2 rounded text-slate-500">
            Damage = (UV + Ozone) * (1 - Bloom)
          </div>
        </div>

        {/* Logic Block 3 */}
        <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800/50 hover:border-slate-700 transition-colors">
           <div className="flex items-center gap-2 mb-3">
             <div className="w-8 h-8 rounded-full bg-blue-950 flex items-center justify-center border border-blue-900">
               <Wind className="w-4 h-4 text-blue-400" />
             </div>
             <span className="font-semibold text-slate-200 text-sm">Dynamic Shedding</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
             While stationary, bloom accumulates (Healthy). While driving, mechanical flex and wind shear strip the oxidized layer, exposing fresh black rubber.
          </p>
          <div className="text-[10px] font-mono bg-slate-900 p-2 rounded text-slate-500">
             Shedding = Speed * Flex_Freq
          </div>
        </div>

        {/* Logic Block 4 (Wear) */}
        <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800/50 hover:border-slate-700 transition-colors">
           <div className="flex items-center gap-2 mb-3">
             <div className="w-8 h-8 rounded-full bg-cyan-950 flex items-center justify-center border border-cyan-900">
               <Disc className="w-4 h-4 text-cyan-400" />
             </div>
             <span className="font-semibold text-slate-200 text-sm">Friction & Wear</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Tread depth degrades based on friction coeff derived from speed and temperature. High temps soften rubber, increasing wear rate.
          </p>
          <div className="text-[10px] font-mono bg-slate-900 p-2 rounded text-slate-500">
             Wear = Speed * Temp * Coeff
          </div>
        </div>

        {/* Logic Block 5 */}
        <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800/50 hover:border-slate-700 transition-colors">
           <div className="flex items-center gap-2 mb-3">
             <div className="w-8 h-8 rounded-full bg-red-950 flex items-center justify-center border border-red-900">
               <GitBranch className="w-4 h-4 text-red-400" />
             </div>
             <span className="font-semibold text-slate-200 text-sm">Fracture Mechanics</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Once the internal wax reservoir is depleted below 5%, the model transitions to a "Dry Rot" state, predicting crack propagation based on accumulated oxidation.
          </p>
          <div className="text-[10px] font-mono bg-slate-900 p-2 rounded text-slate-500">
             IF Wax &lt; 5% THEN Integrity -= 0.05
          </div>
        </div>

      </div>
    </div>
  );
};