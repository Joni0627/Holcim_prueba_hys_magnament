
export interface Company {
  id: string;
  name: string;
}

export interface Area {
  id: string;
  name: string;
}

export interface JobPosition {
  id: string;
  name: string;
}

export interface StandardType {
  id: string;
  name: string;
}

export interface RiskType {
  id: string;
  name: string;
}

export interface Vehicle {
  id: string;
  plate: string; // Patente
  brand: string;
  model: string;
}

export interface Machine {
  id: string;
  serialNumber: string;
  brand: string;
  model: string;
}

export type UserRole = 'Gerencia' | 'Jefatura' | 'Coordinador' | 'Supervisor' | 'Operario' | 'Pasante';
export type UserProfile = 'Administrador' | 'Usuario' | 'Usuario Tercero';

export interface User {
  id: string; // DNI or Legajo
  firstName: string;
  lastName: string;
  emails: string[]; // Supports multiple emails
  role: UserRole; // Cargo
  position: string; // Puesto (from the long list)
  profile: UserProfile;
  bossId?: string; // Reference to another User ID
  companyId: string;
  areaId: string;
  photoUrl?: string;
  
  // Legacy fields for backward compatibility with UI mocks
  name?: string; // Computed getter in real app
  avatarUrl?: string; 
  department?: string; // mapped to Area
}

export enum MOCStatus {
  DRAFT = 'Borrador',
  PENDING_REVIEW = 'Pendiente Revisión',
  APPROVED = 'Aprobado',
  IN_PROGRESS = 'En Ejecución',
  COMPLETED = 'Finalizado',
}

export interface MOCRecord {
  id: string;
  title: string;
  description: string;
  location: string;
  risks: string[];
  mitigations: string[];
  status: MOCStatus;
  createdAt: string;
  createdBy: string;
}

// --- SCAFFOLDS TYPES ---

export enum ScaffoldStatus {
  ARMADO = 'ARMADO',
  INSPECCIONADO = 'INSPECCIONADO',
  A_DESMONTAR = 'A DESMONTAR',
  DESMONTADO = 'DESMONTADO'
}

export type ScaffoldType = 'DE ACCESO' | 'TRABAJO';

export interface Scaffold {
  id: string;
  // Header Data
  assemblyDate: string; // Fecha montaje
  inspectionDate?: string; // Fecha inspección (assigned after check)
  expiryDate?: string; // Fecha vencimiento (+7 days)
  requester: string; // Solicitante
  assemblyCompanyId: string; // Empresa montaje
  inspectorId: string; // DNI Inspector
  officialScaffolder: string; // Andamista oficial
  locationDescription: string;
  cubicMeters: number;
  height: number;
  type: ScaffoldType;
  coordinates?: { lat: number; lng: number }; // Maps integration
  
  status: ScaffoldStatus;
  
  // Inspection Result
  isOperational?: boolean; // Habilitado manual override
  checklistResponses?: Record<string, ChecklistResponse>; // Keyed by Question ID
}

export interface ChecklistResponse {
  questionId: string;
  status: 'OK' | 'NO_CUMPLE';
  observation?: string;
  photoUrl?: string;
}

export interface ChecklistItemTemplate {
  id: string;
  section: 'BASE DEL ANDAMIO' | 'CUERPO DEL ANDAMIO' | 'PLATAFORMA DE TRABAJO';
  text: string;
  description?: string; // Help text / Standard criteria
  allowPhoto: boolean;
}

// --- TRAINING TYPES ---

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: string; 
  status: 'pending' | 'completed' | 'failed';
  dueDate: string;
  contentUrl?: string; 
}

export interface Certification {
  id: string;
  name: string;
  issuedDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'pending';
}