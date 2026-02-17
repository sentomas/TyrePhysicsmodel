import { useState, useEffect, useRef } from 'react';
import { TyreModelData, TyreState, SimulationParams, TyreProperties } from '../types';
import { INITIAL_WAX_RESERVE, WARNING_WAX_THRESHOLD, CRITICAL_INTEGRITY_THRESHOLD, MIN_TREAD_DEPTH } from '../constants';

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
      let wearResistance = 1.0; // Higher is better

      if (currentProps.rubberCompound === 'Soft (Sport)') {
        wearResistance = 0.6; // Wears fast
        diffusionMultiplier = 1.2; // Porous
      } else if (currentProps.rubberCompound === 'Hard (Eco/Touring)') {
        wearResistance = 1.4; // Wears slow
        diffusionMultiplier = 0.8; // Dense
      }

      if (currentProps.antiozonantType === '6PPD') {
        diffusionMultiplier *= 1.1; // Fast migration
      }

      // 1. Wax Diffusion (Blooming) - Fick's First Law Approximation
      // Rate depends on concentration gradient (WaxReserve) and Temperature
      const baseDiffusionRate = (temperature > 15 ? (temperature - 15) / 50 : 0.05) * (waxReserve / 100);
      const diffusionRate = baseDiffusionRate * diffusionMultiplier;
      
      if (!isMoving) {
        // Accumulate bloom (Stagnant)
        if (waxReserve > 0) {
          const bloomIncrease = diffusionRate * 0.5; 
          surfaceBloom = Math.min(100, surfaceBloom + bloomIncrease);
          waxReserve = Math.max(0, waxReserve - (bloomIncrease * 0.1)); 
        }
      } else {
        // Shed bloom due to mechanical flex and wind shear
        const shedRate = (speed / 100) * 2;
        surfaceBloom = Math.max(0, surfaceBloom - shedRate);
        
        // Mileage accrual: 1 Tick @ 100km/h = 1km traveled (Accelerated Simulation Time)
        const distanceStep = (speed * 0.01); 
        mileage += distanceStep;

        // 2. Tread Wear Logic (Archard's Equation adapted)
        // Wear Volume = (k * Load * Distance) / Hardness
        // We simulate mm loss per km.
        // Base rate: 1mm loss per 15,000km under normal conditions.
        // 1km wear = 1 / 15000 = 0.000066 mm/km
        
        const baseWearPerKm = 0.000066;
        
        // Temperature Penalty: Hot rubber is softer (abrades 20% faster per 10 degrees over 25C)
        const thermalSoftening = Math.max(1, 1 + ((temperature - 25) / 50));
        
        // Speed Penalty: Energy varies with square of speed, but wear is roughly linear to aggressive driving
        const aggressionFactor = Math.max(1, speed / 80); 

        const wearStep = distanceStep * baseWearPerKm * thermalSoftening * aggressionFactor * (1 / wearResistance);
        
        treadDepth = Math.max(0, treadDepth - wearStep);
      }

      // 3. Oxidation & Degradation (Arrhenius Equation simplified)
      // UV and Ozone attack polymer chains. Wax bloom blocks this.
      const protectionFactor = surfaceBloom / 100;
      const environmentalStress = (uvIndex / 10) + (ozoneLevel / 200); 
      const damageRate = environmentalStress * (1 - protectionFactor) * 0.05;

      oxidationLevel = Math.min(100, oxidationLevel + damageRate);

      // 4. Structural Integrity (Fracture Mechanics)
      // Once wax is gone, dry rot sets in logarithmically based on oxidation
      let integrityLossMultiplier = 1.0;
      if (currentProps.curingTime < 12) integrityLossMultiplier = 1.2;

      if (oxidationLevel > 30 || waxReserve < 5) {
        // Paris Law approximation for crack growth
        const rotRate = ((oxidationLevel / 2000) + (waxReserve < 5 ? 0.02 : 0)) * integrityLossMultiplier;
        structuralIntegrity = Math.max(0, structuralIntegrity - rotRate);
      }
      
      // Accelerated integrity loss if tread is critically low (carcass exposure risk)
      if (treadDepth < MIN_TREAD_DEPTH) {
         structuralIntegrity = Math.max(0, structuralIntegrity - 0.05);
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

      // 6. RUL Calculation (Remaining Useful Life)
      // Weighted average of Chemical RUL (Wax/Oxidation) and Mechanical RUL (Tread)
      
      // Chemical Life
      const chemicalRul = (structuralIntegrity / 100) * (waxReserve * 10) + 100;
      
      // Mechanical Life (Tread remaining / Rate)
      // Rate is dynamic, so we use a moving average concept or current params
      const projectedRangeKm = Math.max(0, (treadDepth - MIN_TREAD_DEPTH) / (0.000066 * (1/wearResistance)));
      // Convert km to days based on avg usage (e.g. 50km/day)
      const mechanicalRul = projectedRangeKm / 50; 

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