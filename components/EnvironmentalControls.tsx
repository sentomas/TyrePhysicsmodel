import React from 'react';
import { SimulationParams } from '../types';
import { Sun, Wind, Thermometer, Gauge, Car, Zap, Clock } from 'lucide-react';

interface Props {
  params: SimulationParams;
  onChange: (newParams: SimulationParams) => void;
  simulationSpeed: number;
  onSpeedChange: (speed: number) => void;
}

const ControlSlider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  icon: React.ReactNode;
  onChange: (val: number) => void;
  colorClass: string;
  step?: number;
}> = ({ label, value, min, max, unit, icon, onChange, colorClass, step = 1 }) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-1">
      <div className="flex items-center gap-2 text-slate-300">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-sm font-mono text-slate-100">{value} {unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-700 ${colorClass}`}
    />
  </div>
);

export const EnvironmentalControls: React.FC<Props> = ({ params, onChange, simulationSpeed, onSpeedChange }) => {
  const update = (key: keyof SimulationParams, val: any) => {
    onChange({ ...params, [key]: val });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-full shadow-lg flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-6 border-b border-slate-800 pb-2 flex items-center gap-2">
        <Wind className="w-5 h-5 text-blue-400" /> Environment Stressors
      </h3>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <ControlSlider
          label="UV Index"
          value={params.uvIndex}
          min={0}
          max={12}
          unit=""
          icon={<Sun className="w-4 h-4 text-orange-400" />}
          onChange={(v) => update('uvIndex', v)}
          colorClass="accent-orange-500"
        />

        <ControlSlider
          label="Ozone Level"
          value={params.ozoneLevel}
          min={0}
          max={300}
          unit="ppb"
          icon={<Wind className="w-4 h-4 text-purple-400" />}
          onChange={(v) => update('ozoneLevel', v)}
          colorClass="accent-purple-500"
        />

        <ControlSlider
          label="Temperature"
          value={params.temperature}
          min={-20}
          max={60}
          unit="°C"
          icon={<Thermometer className="w-4 h-4 text-red-400" />}
          onChange={(v) => update('temperature', v)}
          colorClass="accent-red-500"
        />

        <div className="mt-6 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-4">Telematics</h4>
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-300 flex items-center gap-2">
              <Car className="w-4 h-4" /> Vehicle State
            </span>
            <button
              onClick={() => update('isMoving', !params.isMoving)}
              className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                params.isMoving 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                  : 'bg-slate-700 text-slate-400 border border-slate-600'
              }`}
            >
              {params.isMoving ? 'DRIVING' : 'PARKED'}
            </button>
          </div>

          <ControlSlider
            label="Speed / Flex Freq"
            value={params.speed}
            min={0}
            max={150}
            unit="km/h"
            icon={<Gauge className="w-4 h-4 text-cyan-400" />}
            onChange={(v) => update('speed', v)}
            colorClass="accent-cyan-500"
          />
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800">
           <h4 className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
             <Clock className="w-3 h-3" /> Time Warp
           </h4>
           <ControlSlider
            label="Simulation Speed"
            value={simulationSpeed}
            min={0.1}
            max={5}
            step={0.1}
            unit="x"
            icon={<Zap className="w-4 h-4 text-yellow-400" />}
            onChange={onSpeedChange}
            colorClass="accent-yellow-500"
          />
        </div>
      </div>
    </div>
  );
};