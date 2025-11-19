
export enum OptimizationStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING', // Uploading and parsing
  OPTIMIZING = 'OPTIMIZING', // Calculating route
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface DeliveryStop {
  id: string;
  clientCode?: string; // Código do cliente
  customerName: string;
  zipCode?: string; // CEP
  address: string;
  city: string;
  priority: 'Alta' | 'Normal' | 'Baixa';
  estimatedLat: number;
  estimatedLng: number;
  notes?: string;
  orderIndex: number; // The optimized sequence number from the AI
  assignedFleetId?: string | null; // ID of the fleet assigned to this specific stop
}

export interface RoutePlan {
  stops: DeliveryStop[];
  totalDistanceKm: number; // Estimated
  totalTimeMinutes: number; // Estimated
  summary: string;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

// Team Management Types
export type MemberRole = 'Motorista' | 'Auxiliar' | 'Operador';

export interface TeamMember {
  id: string;
  name: string;
  role: MemberRole;
  specificType: string; // e.g., 'Motorista Granel', 'Auxiliar de Distribuição'
  active: boolean;
  statusReason?: string; // e.g., "Folga", "Férias", "Atestado" - if undefined, assumed Available
}

export interface Fleet {
  id: string;
  number: string; // e.g., "113", "173"
  members: TeamMember[]; // The crew assigned to this fleet
}
