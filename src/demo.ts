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
    {
      id: "j1",
      title: "Pérdida bajo mesada",
      trade: "Plomería",
      amount: 85000,
      zone: "San Martín",
      status: "available",
      location: { latitude: -34.5755, longitude: -58.5371 },
      distanceKm: 2.1,
    },
    {
      id: "j2",
      title: "Cambio de grifería",
      trade: "Plomería",
      amount: 65000,
      zone: "Villa Ballester",
      status: "available",
      location: { latitude: -34.5483, longitude: -58.5567 },
      distanceKm: 3.4,
    },
    {
      id: "j3",
      title: "Revisión de tanque",
      trade: "Plomería",
      amount: 110000,
      zone: "San Andrés",
      status: "available",
      location: { latitude: -34.5628, longitude: -58.5344 },
      distanceKm: 4.7,
    },
  ],
  requests: [],
  requestedBenefits: [],
};
