import { useState, useEffect, useRef } from 'react';
import { TyreModelData, TyreState, SimulationParams, TyreProperties } from '../types';
import { INITIAL_WAX_RESERVE, WARNING_WAX_THRESHOLD, CRITICAL_INTEGRITY_THRESHOLD, INITIAL_TREAD_DEPTH, MIN_TREAD_DEPTH } from '../constants';

export const useTyreModel = (
  params: SimulationParams, 
  tyreProperties: TyreProperties,
  simulationSpeed: number = 1, 
  initialData?: TyreModelData
) => {
  const [data, setData] = useState<TyreModelData>(initialData || {
    waxReserve: INITIAL_WAX_RESERVE,
    surfaceBloom: 0,
    oxidationLevel: 0,
    structuralIntegrity: 100,
    treadDepth: tyreProperties.initialTreadDepth,
    mileage: 0,
    state: TyreState.ACTIVE,
    rul: 1000 // Days estimate
  });

  const [history, setHistory] = useState<TyreModelData[]>([]);

  // Use a ref to keep track of the simulation loop without adding it to dependency array explicitly for every tick
  const stateRef = useRef(data);
  const propsRef = useRef(tyreProperties);

  useEffect(() => {
    stateRef.current = data;
  }, [data]);

  useEffect(() => {
    propsRef.current = tyreProperties;
  }, [tyreProperties]);

  useEffect(() => {
    // Base tick is 500ms. Speed multiplier reduces this delay.
    const tickDelay = 500 / Math.max(0.1, simulationSpeed);

    const interval = setInterval(() => {
      const currentState = stateRef.current;
      const currentProps = propsRef.current;
      const { uvIndex, ozoneLevel, temperature, isMoving, speed } = params;

      let { waxReserve, surfaceBloom, oxidationLevel, structuralIntegrity, treadDepth, mileage } = currentState;

      // --- PHYSICS ENGINE LOGIC ---

      // Material Multipliers
      // Soft compounds bloom easier but wear faster.
      // 6PPD is highly effective but consumed faster.
      let diffusionMultiplier = 1.0;
      let wearMultiplier = 1.0;

      if (currentProps.rubberCompound === 'Soft (Sport)') {
        wearMultiplier = 1.5;
        diffusionMultiplier = 1.2; // Porous
      } else if (currentProps.rubberCompound === 'Hard (Eco/Touring)') {
        wearMultiplier = 0.7;
        diffusionMultiplier = 0.8; // Dense
      }

      if (currentProps.antiozonantType === '6PPD') {
        diffusionMultiplier *= 1.1; // Fast migration
      }

      // 1. Wax Diffusion (Blooming)
      const baseDiffusionRate = (temperature > 15 ? (temperature - 15) / 50 : 0.05) * (waxReserve / 100);
      const diffusionRate = baseDiffusionRate * diffusionMultiplier;
      
      if (!isMoving) {
        // Accumulate bloom
        if (waxReserve > 0) {
          const bloomIncrease = diffusionRate * 0.5; 
          surfaceBloom = Math.min(100, surfaceBloom + bloomIncrease);
          waxReserve = Math.max(0, waxReserve - (bloomIncrease * 0.1)); 
        }
      } else {
        // Shed bloom due to flex
        const shedRate = (speed / 100) * 2;
        surfaceBloom = Math.max(0, surfaceBloom - shedRate);
        
        // Mileage accrual
        mileage += (speed * 0.01); 
      }

      // 2. Tread Wear Logic (New)
      // Wear is proportional to speed (friction)
      if (isMoving) {
        // Base wear rate * speed factor * temperature penalty (hotter = softer rubber = faster wear)
        const tempFactor = Math.max(1, temperature / 20);
        const wearRate = (speed / 100) * 0.005 * tempFactor * wearMultiplier;
        treadDepth = Math.max(0, treadDepth - wearRate);
      }

      // 3. Oxidation & Degradation
      const protectionFactor = surfaceBloom / 100;
      const environmentalStress = (uvIndex / 10) + (ozoneLevel / 200); 
      const damageRate = environmentalStress * (1 - protectionFactor) * 0.05;

      oxidationLevel = Math.min(100, oxidationLevel + damageRate);

      // 4. Structural Integrity (Dry Rot + Low Tread)
      // Curing time effect: Optimal curing (approx 15-20 mins) gives best integrity. 
      // Deviation weakens initial resistance.
      let integrityLossMultiplier = 1.0;
      if (currentProps.curingTime < 12) integrityLossMultiplier = 1.2;

      if (oxidationLevel > 30 || waxReserve < 5) {
        const rotRate = ((oxidationLevel / 1000) + (waxReserve < 5 ? 0.05 : 0)) * integrityLossMultiplier;
        structuralIntegrity = Math.max(0, structuralIntegrity - rotRate);
      }
      
      // Accelerated integrity loss if tread is critically low (structural exposure)
      if (treadDepth < MIN_TREAD_DEPTH) {
         structuralIntegrity = Math.max(0, structuralIntegrity - 0.1);
      }

      // 5. State Determination
      let newState = TyreState.ACTIVE;
      if (structuralIntegrity < CRITICAL_INTEGRITY_THRESHOLD || treadDepth <= MIN_TREAD_DEPTH) {
        newState = TyreState.CRITICAL;
      } else if (waxReserve < WARNING_WAX_THRESHOLD || treadDepth < 3.0) {
        newState = TyreState.WARNING;
      } else if (surfaceBloom > 20) {
        newState = TyreState.MINT; // Healthy Blooming
      } else {
        newState = TyreState.ACTIVE; // Deep black / clean
      }

      // 6. RUL Calculation 
      // Weighted average of Chemical RUL (Wax/Oxidation) and Mechanical RUL (Tread)
      
      // Chemical Life
      const chemicalRul = (structuralIntegrity / 100) * (waxReserve * 10) + 100;
      
      // Mechanical Life (Tread remaining / Rate)
      // Assuming avg linear degradation, approx mapping mm to days
      const mechanicalRul = Math.max(0, (treadDepth - MIN_TREAD_DEPTH) * 200 / wearMultiplier); 

      const finalRul = Math.min(chemicalRul, mechanicalRul);

      const updatedState: TyreModelData = {
        waxReserve,
        surfaceBloom,
        oxidationLevel,
        structuralIntegrity,
        treadDepth,
        mileage,
        state: newState,
        rul: Math.floor(finalRul)
      };

      setData(updatedState);
      setHistory(prev => [...prev.slice(-49), updatedState]); 

    }, tickDelay); 

    return () => clearInterval(interval);
  }, [params, simulationSpeed, tyreProperties]);

  const resetSimulation = () => {
    setData({
      waxReserve: INITIAL_WAX_RESERVE,
      surfaceBloom: 0,
      oxidationLevel: 0,
      structuralIntegrity: 100,
      treadDepth: propsRef.current.initialTreadDepth,
      mileage: 0,
      state: TyreState.ACTIVE,
      rul: 1000
    });
    setHistory([]);
  };

  const injectState = (overrides: Partial<TyreModelData>) => {
    setData(prev => ({ ...prev, ...overrides }));
  };

  return { data, history, resetSimulation, injectState };
};