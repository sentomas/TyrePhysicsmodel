import React, { useState, useEffect } from 'react';
import { useTyreModel } from './hooks/useTireModel';
import { SimulationParams, AnalysisResult, TyreModelData, TyreProperties } from './types';
import { EnvironmentalControls } from './components/EnvironmentalControls';
import { TyreHealthCard } from './components/TireHealthCard';
import { VisualInspector } from './components/VisualInspector';
import { AnalysisPanel } from './components/AnalysisPanel';
import { FractureMechanicsCard } from './components/FractureMechanicsCard';
import { PhysicsModelInfo } from './components/PhysicsModelInfo';
import { AboutTile } from './components/AboutTile';
import { TyreConfigModal } from './components/TyreConfigModal';
import { Settings, RefreshCw } from 'lucide-react';

const STORAGE_KEY = 'tyreTwinState_v3';

const App: React.FC = () => {
  // Load initial state from localStorage
  const [savedState] = useState<{params: SimulationParams, data: TyreModelData, props?: TyreProperties} | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to load state", e);
      return null;
    }
  });

  const [params, setParams] = useState<SimulationParams>(savedState?.params || {
    uvIndex: 5,
    ozoneLevel: 40,
    temperature: 25,
    isMoving: false,
    speed: 0
  });

  const [tyreProps, setTyreProps] = useState<TyreProperties>(savedState?.props || {
    curingTime: 18,
    antiozonantType: '6PPD',
    rubberCompound: 'Medium (All-Season)',
    initialTreadDepth: 8.0,
    manufacturerLife: 50000
  });

  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Initialize model with saved data if available
  const { data, history, resetSimulation, injectState } = useTyreModel(params, tyreProps, simulationSpeed, savedState?.data);
  const [lastAnalysis, setLastAnalysis] = useState<AnalysisResult | null>(null);

  // Save state changes to localStorage
  useEffect(() => {
    const stateToSave = { params, data, props: tyreProps };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [params, data, tyreProps]);

  const handleAnalysisComplete = (result: AnalysisResult, overrides: Partial<TyreModelData>) => {
    setLastAnalysis(result);
    injectState(overrides);
  };

  const handleReset = () => {
    resetSimulation();
    setParams({
      uvIndex: 5,
      ozoneLevel: 40,
      temperature: 25,
      isMoving: false,
      speed: 0
    });
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      <TyreConfigModal 
        isOpen={isConfigOpen} 
        onClose={() => setIsConfigOpen(false)}
        properties={tyreProps}
        onSave={setTyreProps}
      />

      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-mono font-bold text-white shadow-lg shadow-indigo-500/20">T</div>
             <span className="font-bold text-lg tracking-tight text-white">TyreTwin <span className="text-indigo-400 font-light">Analytics</span></span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleReset}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
              title="Reset Simulation"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-slate-800"></div>
            <button 
              onClick={() => setIsConfigOpen(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors flex items-center gap-2"
              title="Tyre Configuration"
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs font-medium hidden sm:inline">Tyre Specs</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Top Section: Digital Twin Card & Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Health Card (Main Focus) */}
          <div className="lg:col-span-4">
             <TyreHealthCard data={data} properties={tyreProps} />
          </div>

          {/* Center: Physics/Env Controls */}
          <div className="lg:col-span-3">
             <EnvironmentalControls 
                params={params} 
                onChange={setParams} 
                simulationSpeed={simulationSpeed}
                onSpeedChange={setSimulationSpeed}
             />
          </div>

          {/* Right: Visual Input */}
          <div className="lg:col-span-5">
             <VisualInspector onAnalysisComplete={handleAnalysisComplete} />
          </div>

        </div>

        {/* Middle Section: Analytics & Fracture Mechanics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2">
             <AnalysisPanel history={history} lastAnalysis={lastAnalysis} />
           </div>
           <div className="lg:col-span-1">
             <FractureMechanicsCard data={data} params={params} />
           </div>
        </div>

        {/* Bottom Section: Physics Info & About */}
        <div className="grid grid-cols-1 gap-6">
          <PhysicsModelInfo />
          <AboutTile />
        </div>

      </main>
    </div>
  );
};

export default App;