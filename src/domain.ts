export type WorkStatus = "available" | "accepted" | "completed";
export type BenefitStatus = "locked" | "available" | "requested" | "active";

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
  requestedBenefits: string[];
}
