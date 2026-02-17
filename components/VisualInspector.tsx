import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, CheckCircle2, AlertOctagon } from 'lucide-react';
import { analyzeTireImage } from '../services/geminiService';
import { AnalysisResult, TyreModelData, TyreState } from '../types';

interface Props {
  onAnalysisComplete: (result: AnalysisResult, overrides: Partial<TyreModelData>) => void;
}

export const VisualInspector: React.FC<Props> = ({ onAnalysisComplete }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        runAnalysis(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async (base64Image: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      // Strip prefix for API
      const base64Data = base64Image.split(',')[1];
      const result = await analyzeTireImage(base64Data);
      
      // Translate Gemini analysis to Physics Model overrides
      const overrides: Partial<TyreModelData> = {};
      
      if (result.bloomDetected) {
        overrides.state = TyreState.MINT;
        overrides.surfaceBloom = 85; // High bloom visual
        overrides.waxReserve = 90; // Likely healthy if blooming
        overrides.oxidationLevel = 5;
      } else if (result.hueColor.toLowerCase().includes('grey') || result.condition.toLowerCase().includes('dry')) {
        overrides.state = TyreState.WARNING;
        overrides.surfaceBloom = 0;
        overrides.oxidationLevel = 70;
        overrides.waxReserve = 10;
      } else if (result.cracksDetected) {
        overrides.state = TyreState.CRITICAL;
        overrides.structuralIntegrity = 30;
      } else {
        // Default to active/black
        overrides.state = TyreState.ACTIVE;
        overrides.surfaceBloom = 5;
        overrides.oxidationLevel = 20;
      }

      // Update tread estimate from visual if confidence is high
      if (result.estimatedWear > 0) {
          // approx mapping % wear to mm (8mm start)
          const remainingMm = 8.0 * ((100 - result.estimatedWear) / 100);
          overrides.treadDepth = Math.max(1.6, remainingMm);
      }

      onAnalysisComplete(result, overrides);
    } catch (err) {
      setError("Failed to analyze image. Please check API Key or try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-full flex flex-col relative overflow-hidden">
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
      
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 relative z-10">
        <Camera className="w-5 h-5 text-indigo-400" /> Visual Verification
      </h3>

      <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-xl bg-slate-950/50 relative overflow-hidden group transition-all duration-300 hover:border-indigo-500/50 hover:bg-slate-950/80">
        
        {preview ? (
          <img src={preview} alt="Tyre Preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        ) : (
          <div className="text-center p-6 z-10">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400 group-hover:text-white group-hover:scale-110 group-hover:bg-indigo-600 shadow-lg group-hover:shadow-indigo-500/30 transition-all duration-300">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm text-slate-400 mb-1 group-hover:text-slate-200 transition-colors">Upload Tyre Photo</p>
            <p className="text-xs text-slate-500">Supports JPG, PNG</p>
          </div>
        )}

        {isAnalyzing && (
          <div className="absolute inset-0 z-20">
             {/* Backdrop */}
             <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center">
                <div className="relative mb-4">
                   <div className="absolute inset-0 bg-indigo-500/30 blur-2xl rounded-full animate-pulse"></div>
                   <Loader2 className="relative w-12 h-12 text-indigo-400 animate-spin" />
                </div>
                <p className="text-indigo-300 text-xs font-mono animate-pulse tracking-widest font-bold">SCANNING TYRE TOPOLOGY...</p>
                <div className="flex gap-1.5 mt-3">
                   <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                   <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                   <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
             </div>
             
             {/* Scanning Line Animation */}
             <div 
               className="absolute left-0 w-full h-1 bg-emerald-400/80 shadow-[0_0_20px_rgba(52,211,153,1)]"
               style={{ animation: 'scan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite' }}
             ></div>
          </div>
        )}

        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="absolute inset-0 opacity-0 cursor-pointer z-30"
          disabled={isAnalyzing}
        />
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-950/30 border border-red-500/30 rounded-lg flex items-start gap-2 text-xs text-red-300 animate-in slide-in-from-top-2">
          <AlertOctagon className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Instructions / Legend */}
      <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2 p-2 rounded bg-slate-950/50 border border-slate-800 text-slate-400">
           <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
           <span>Green Tint = Healthy</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded bg-slate-950/50 border border-slate-800 text-slate-400">
           <div className="w-2 h-2 rounded-full bg-slate-500"></div>
           <span>Grey = Oxidized</span>
        </div>
      </div>
    </div>
  );
};