import { AppState } from "./domain";

export const initialState: AppState = {
  worker: {
    id: "worker-demo-1",
    name: "Carlos Gómez",
    trade: "Plomería",
    verified: true,
    formalized: false,
    monthlyRegisteredIncome: 640000,
    lifetimeRegisteredIncome: 2140000,
    completedJobs: 8,
    activeMonths: 4,
  },
  jobs: [
    { id: "j1", title: "Pérdida bajo mesada", trade: "Plomería", amount: 85000, zone: "San Martín", status: "available" },
    { id: "j2", title: "Cambio de grifería", trade: "Plomería", amount: 65000, zone: "Villa Ballester", status: "available" },
    { id: "j3", title: "Revisión de tanque", trade: "Plomería", amount: 110000, zone: "San Andrés", status: "available" },
  ],
  requestedBenefits: [],
};
