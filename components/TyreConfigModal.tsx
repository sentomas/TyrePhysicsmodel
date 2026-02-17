import React from 'react';
import { TyreProperties } from '../types';
import { Settings, Beaker, Clock, Layers, Disc, X, Award } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  properties: TyreProperties;
  onSave: (props: TyreProperties) => void;
}

export const TyreConfigModal: React.FC<Props> = ({ isOpen, onClose, properties, onSave }) => {
  if (!isOpen) return null;

  const [localProps, setLocalProps] = React.useState<TyreProperties>(properties);

  const handleChange = (key: keyof TyreProperties, value: any) => {
    setLocalProps(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(localProps);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Tyre Manufacturing Specs</h2>
              <p className="text-xs text-slate-400">Define material properties for Digital Twin</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Curing Time */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Clock className="w-4 h-4 text-emerald-400" /> Curing Time (Minutes)
            </label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="10" 
                max="30" 
                step="1"
                value={localProps.curingTime}
                onChange={(e) => handleChange('curingTime', Number(e.target.value))}
                className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="font-mono text-white bg-slate-800 px-3 py-1 rounded-md border border-slate-700 min-w-[3rem] text-center">
                {localProps.curingTime}
              </span>
            </div>
            <p className="text-xs text-slate-500">Optimal curing time is ~15-18 mins. Affects structural integrity baseline.</p>
          </div>

          {/* Chemical / Antiozonant */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Beaker className="w-4 h-4 text-blue-400" /> Antiozonant Chemical
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['6PPD', '77PD', 'Natural Wax'].map((type) => (
                <button
                  key={type}
                  onClick={() => handleChange('antiozonantType', type)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    localProps.antiozonantType === type
                      ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500">Determines bloom diffusion rate and oxidation resistance.</p>
          </div>

          {/* Rubber Compound */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Layers className="w-4 h-4 text-purple-400" /> Rubber Compound
            </label>
            <select
              value={localProps.rubberCompound}
              onChange={(e) => handleChange('rubberCompound', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="Soft (Sport)">Soft (Sport) - High Grip / High Wear</option>
              <option value="Medium (All-Season)">Medium (All-Season) - Balanced</option>
              <option value="Hard (Eco/Touring)">Hard (Eco/Touring) - Low Rolling Res / Low Wear</option>
            </select>
          </div>

           {/* Initial Tread */}
           <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Disc className="w-4 h-4 text-cyan-400" /> Initial Tread Depth (mm)
            </label>
            <div className="flex items-center gap-4">
              <input 
                type="number" 
                min="4" 
                max="12" 
                step="0.1"
                value={localProps.initialTreadDepth}
                onChange={(e) => handleChange('initialTreadDepth', Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 text-sm focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
              />
            </div>
          </div>

           {/* Manufacturer Life */}
           <div className="space-y-2 border-t border-slate-800 pt-4">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Award className="w-4 h-4 text-yellow-400" /> Prescribed Manufacturer Life (km)
            </label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="20000" 
                max="100000" 
                step="1000"
                value={localProps.manufacturerLife || 50000}
                onChange={(e) => handleChange('manufacturerLife', Number(e.target.value))}
                className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
              <span className="font-mono text-white bg-slate-800 px-3 py-1 rounded-md border border-slate-700 min-w-[5rem] text-center">
                {(localProps.manufacturerLife || 50000).toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-slate-500">The warranty mileage provided by the tyre manufacturer.</p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex justify-end gap-3 mt-auto">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium shadow-lg shadow-indigo-500/25 transition-all"
          >
            Apply Configuration
          </button>
        </div>
      </div>
    </div>
  );
};