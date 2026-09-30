# Backend objetivo

Separar desde el inicio:

- Identity Service
- Worker Profile / Skills
- Jobs & Matching
- Work Ledger
- Receipts / Formalization adapter
- Contributions adapter
- Benefits Engine
- Institutional Capacity API
- Notifications
- Audit/Event Log
- AI Orchestrator

## Regla

La IA interpreta, resume y recomienda. Elegibilidad, pagos, reputación, beneficios y formalización deben usar reglas determinísticas y auditables.

## Persistencia

Para MVP real: API + base de datos central. El localStorage del prototipo web no debe migrarse como almacenamiento productivo.
