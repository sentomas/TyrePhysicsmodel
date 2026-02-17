export enum TyreState {
  MINT = 'MINT',     // Green/Brown bloom visible, high protection
  ACTIVE = 'ACTIVE', // Deep black, bloom shedding due to driving
  WARNING = 'WARNING', // Faded grey, low wax, dry rot risk
  CRITICAL = 'CRITICAL' // Cracking visible or Tread worn out
}

export interface SimulationParams {
  uvIndex: number; // 0-11+
  ozoneLevel: number; // ppb
  temperature: number; // Celsius
  isMoving: boolean; // Stationary vs Driving
  speed: number; // km/h (affects flex frequency)
}

export interface TyreProperties {
  curingTime: number; // minutes
  antiozonantType: '6PPD' | '77PD' | 'Natural Wax';
  rubberCompound: 'Soft (Sport)' | 'Medium (All-Season)' | 'Hard (Eco/Touring)';
  initialTreadDepth: number; // mm
  manufacturerLife: number; // km (Prescribed life)
}

export interface TyreModelData {
  waxReserve: number; // 0-100%
  surfaceBloom: number; // 0-100% (amount of wax on surface)
  oxidationLevel: number; // 0-100% (damage)
  structuralIntegrity: number; // 0-100% (inv of cracks)
  treadDepth: number; // mm (New: Wear indicator)
  mileage: number; // km
  state: TyreState;
  rul: number; // Remaining Useful Life (days/km)
}

export interface AnalysisResult {
  hueColor: string;
  condition: string;
  bloomDetected: boolean;
  cracksDetected: boolean;
  estimatedWear: number;
  confidence: number;
}