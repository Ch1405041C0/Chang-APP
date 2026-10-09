export type WorkStatus = "available" | "accepted" | "completed";
export type BenefitStatus = "locked" | "available" | "requested" | "active";
export type RequestStatus = "draft" | "searching" | "matched" | "accepted" | "completed";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface WorkerProfile {
  id: string;
  name: string;
  trade: string;
  verified: boolean;
  formalized: boolean;
  monthlyRegisteredIncome: number;
  lifetimeRegisteredIncome: number;
  completedJobs: number;
  activeMonths: number;
}

export interface Job {
  id: string;
  title: string;
  trade: string;
  amount: number;
  zone: string;
  status: WorkStatus;
  location: Coordinates;
  description?: string;
  distanceKm?: number;
}

export interface WorkRequest {
  id: string;
  description: string;
  inferredTrade: string;
  zone: string;
  location: Coordinates;
  status: RequestStatus;
  createdAt: string;
}

export interface BenefitDefinition {
  id: string;
  title: string;
  provider: string;
  description: string;
  minIncome?: number;
  minJobs?: number;
  minActiveMonths?: number;
  requiresVerified?: boolean;
  requiresFormalized?: boolean;
}

export interface BenefitResult extends BenefitDefinition {
  status: BenefitStatus;
  missing: string[];
  progress: number;
}

export interface AppState {
  worker: WorkerProfile;
  jobs: Job[];
  requests: WorkRequest[];
  requestedBenefits: string[];
}
