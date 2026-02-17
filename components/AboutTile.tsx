import React from 'react';
import { Info } from 'lucide-react';

export const AboutTile: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg mb-8">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-indigo-900/20 rounded-full border border-indigo-500/30">
          <Info className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-2">About TyreTwin Analytics</h2>
          <p className="text-slate-400 leading-relaxed max-w-4xl">
            This application uses a physics-informed digital twin to monitor tyre health. 
            It simulates the <span className="text-emerald-400 font-medium">Blooming</span> effect—where antiozonant waxes migrate to the surface to protect against UV radiation—and models the degradation caused by 
            <span className="text-amber-400 font-medium"> Oxidation</span> when this protective layer is depleted. 
            It also predicts <span className="text-cyan-400 font-medium">Tread Wear</span> based on usage and environmental factors.
            When the wax reservoir runs dry, the model predicts <span className="text-red-400 font-medium">Fracture Mechanics</span> leading to dry rot and structural failure.
          </p>
        </div>
      </div>
    </div>
  );
};