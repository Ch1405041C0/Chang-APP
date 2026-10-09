import { Job } from "./domain";

const tradeRules: Array<{ trade: string; words: string[] }> = [
  { trade: "Plomería", words: ["agua", "canilla", "grifer", "pileta", "caño", "tanque", "pérdida", "perdida", "plom"] },
  { trade: "Electricidad", words: ["luz", "enchufe", "cable", "térmica", "termica", "electric", "corto"] },
  { trade: "Pintura", words: ["pint", "pared", "látex", "latex", "humedad"] },
  { trade: "Albañilería", words: ["pared", "revoque", "ladrillo", "cerám", "ceram", "albañ"] },
  { trade: "Carpintería", words: ["puerta", "madera", "mueble", "carpint"] },
];

export function inferTrade(description: string): string {
  const text = description.toLocaleLowerCase("es-AR");
  const found = tradeRules.find(rule => rule.words.some(word => text.includes(word)));
  return found?.trade ?? "Oficios generales";
}

export function matchJobs(jobs: Job[], trade: string): Job[] {
  const exact = jobs.filter(job => job.trade === trade && job.status === "available");
  const candidates = exact.length ? exact : jobs.filter(job => job.status === "available");
  return [...candidates].sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
}
