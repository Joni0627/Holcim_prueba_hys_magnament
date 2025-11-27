export interface Company {
  id: string;
  name: string;
}

export interface Area {
  id: string;
  name: string;
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

export interface ScaffoldInspection {
  id: string;
  scaffoldId: string;
  type: 'Multidireccional' | 'Tubular' | 'Colgante';
  inspector: string;
  date: string;
  passed: boolean;
  issues: string[];
}

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