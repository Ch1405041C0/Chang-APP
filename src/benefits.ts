import { BenefitDefinition, BenefitResult, WorkerProfile } from "./domain";

/**
 * DEMO ONLY.
 * Proveedores y umbrales reales deben cargarse desde convenios/requisitos vigentes.
 */
export const benefitCatalog: BenefitDefinition[] = [
  {
    id: "health-demo",
    title: "Cobertura de salud",
    provider: "Proveedor demo",
    description: "Acceso a una alternativa de cobertura vinculada a actividad demostrable.",
    minIncome: 800000,
    minActiveMonths: 3,
    requiresVerified: true,
  },
  {
    id: "tools-demo",
    title: "Programa de herramientas",
    provider: "Convenio demo",
    description: "Acceso a herramientas de trabajo mediante un programa asociado.",
    minJobs: 10,
    minActiveMonths: 3,
    requiresVerified: true,
  },
  {
    id: "formal-demo",
    title: "Beneficio por actividad formalizada",
    provider: "Programa demo",
    description: "Beneficio disponible cuando la actividad ya está formalizada.",
    minActiveMonths: 6,
    requiresFormalized: true,
  },
];

const clamp = (n: number) => Math.max(0, Math.min(1, n));

export function evaluateBenefits(worker: WorkerProfile, requested: string[] = []): BenefitResult[] {
  return benefitCatalog.map((b) => {
    const missing: string[] = [];
    const ratios: number[] = [];

    if (b.minIncome) {
      ratios.push(clamp(worker.monthlyRegisteredIncome / b.minIncome));
      if (worker.monthlyRegisteredIncome < b.minIncome) {
        missing.push(`$${(b.minIncome - worker.monthlyRegisteredIncome).toLocaleString("es-AR")} de actividad registrada`);
      }
    }

    if (b.minJobs) {
      ratios.push(clamp(worker.completedJobs / b.minJobs));
      if (worker.completedJobs < b.minJobs) {
        missing.push(`${b.minJobs - worker.completedJobs} trabajo(s) completado(s)`);
      }
    }

    if (b.minActiveMonths) {
      ratios.push(clamp(worker.activeMonths / b.minActiveMonths));
      if (worker.activeMonths < b.minActiveMonths) {
        missing.push(`${b.minActiveMonths - worker.activeMonths} mes(es) de actividad`);
      }
    }

    if (b.requiresVerified && !worker.verified) missing.push("verificación de identidad");
    if (b.requiresFormalized && !worker.formalized) missing.push("formalizar la actividad");

    const eligible = missing.length === 0;
    const progress = eligible ? 1 : (ratios.length ? ratios.reduce((a, c) => a + c, 0) / ratios.length : 0);
    const status = requested.includes(b.id) ? "requested" : eligible ? "available" : "locked";

    return { ...b, missing, progress, status };
  });
}
