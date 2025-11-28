
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
  PENDING = 'PENDIENTE',
  APPROVED = 'APROBADO',
  REJECTED = 'RECHAZADO',
  REVIEW = 'REVISIÓN',
  EXECUTION = 'EN EJECUCIÓN',
  COMPLETED = 'FINALIZADO'
}

export interface MOCRecord {
  id: string;
  title: string;
  requesterId: string; // DNI/Legajo Solicitante
  startDate: string;
  endDate: string;
  responsibleId: string; // Responsable Tarea
  approverId: string; // Aprobador
  standardTypeId: string;
  description: string; // Detalle/Análisis
  riskIds: string[]; // Multi-select from RiskType
  involvedAreaIds: string[]; // Multi-select from Area
  imageUrl?: string;
  documentUrl?: string; // PDF/Word
  coordinates?: { lat: number; lng: number };
  actionPlan: string;
  status: MOCStatus;
  
  createdAt: string;
  
  // Computed/Joined fields for display
  locationText?: string; // Helper for legacy view or specific text location
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

// --- TRAINING LMS TYPES ---

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

export interface Evaluation {
  id: string;
  name: string;
  passingScore: number; // e.g., 80
  questions: Question[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  contentUrl?: string; // Video URL or PDF URL
  contentType: 'VIDEO' | 'PDF';
  validityMonths: number; // Vigencia in months
  evaluationId?: string; // Link to an Evaluation
  
  // New flags requested
  isOneTime?: boolean; // Por única vez (no vence o no requiere reválida)
  requiresPractical?: boolean; // Requiere examen práctico
}

export interface TrainingPlan {
  id: string;
  name: string;
  positionIds: string[]; // Array of Job Position Names (strings) or IDs
  courseIds: string[]; // Array of Course IDs
}

export interface QuizAttempt {
  date: string;
  score: number;
  passed: boolean;
  wrongQuestionIds: string[];
}

export interface UserTrainingProgress {
  userId: string;
  courseId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'PENDING_PRACTICAL';
  materialViewed?: boolean; // Track if video/pdf was consumed
  score?: number;
  completionDate?: string;
  expiryDate?: string;
  practicalValidatedBy?: string; // ID of H&S personnel
  practicalValidatedAt?: string;
  attempts?: QuizAttempt[]; // History of attempts
}

export interface Certification {
  id: string;
  name: string;
  issuedDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'pending';
}