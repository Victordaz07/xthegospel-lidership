# Plan Fases 5–8 — Módulo Clases en Vivo (Completo)

Orden de ejecución: **Fase 5 → 6 → 7 → 8**

---

## FASE 5 — Vista del Obispado (Supervisión)

### Objetivo
Dashboard de supervisión para obispado (solo lectura). Ver todas las sesiones del barrio.

### Archivos a crear/modificar

| Archivo | Acción |
|---------|--------|
| `teachingSessionsService.ts` | Añadir `listSessionsForWard(wardId, options?)` — query sin filtro teacherUid, ordenado por updatedAt desc |
| `BishopTeachingDashboard.tsx` | Crear — KPIs, lista sesiones, filtro callingType, botón "Ver reporte" |
| `RoleRequiredRoute.tsx` | Extender con prop opcional `roles?: LeadershipRole[]` — si presente, verificar `isBishopric()` o role en lista |
| `LeadershipCallingsRoutes.tsx` | Añadir rutas `bishop/teaching`, `bishop/teaching/:sessionId/report` con guard bishopric |
| `pages/index.ts` | Export `BishopTeachingDashboard` |

### Detalle técnico

**listSessionsForWard:**
```ts
export async function listSessionsForWard(
  wardId: string,
  options?: { limit?: number; callingType?: CallingType; daysBack?: number }
): Promise<TeachingSession[]>
```
- Query: `wards/{wardId}/teachingSessions` orderBy updatedAt desc
- Opcional: where callingType, where updatedAt >= (now - daysBack*24*60*60*1000)
- Índice: updatedAt (ya existe para teacherUid+updatedAt; para ward solo updatedAt puede requerir nuevo índice)

**BishopricRequiredRoute (o extender RoleRequiredRoute):**
- Si `roles` prop: verificar `useUserRoleStore().isBishopric()` (para roles bishopric)
- Si no es bishopric → Navigate to "/" o dashboard

**BishopTeachingDashboard:**
- KPIs: total sesiones (30 días), asistencia promedio, % completitud promedio
- Para KPIs: usar `buildSessionReport` por sesión (costoso) o crear `getWardTeachingStats` simplificado que agregue
- Alternativa Fase 5: KPIs calculados en cliente desde lista de sesiones + reportes cacheados
- Lista: estado, título, asistencia (requiere participants count — puede ser lazy o en report)
- Filtro: select callingType
- Botón "Ver reporte" → navigate(`/bishop/teaching/${sessionId}/report`)

**Rutas:**
```tsx
<Route path="bishop/teaching" element={<BishopTeachingDashboard />} />
<Route path="bishop/teaching/:sessionId/report" element={<SessionReportPage />} />
```
- Ambas requieren WardRequiredRoute + RoleRequiredRoute. Para bishop-only: wrap en componente que verifica isBishopric.

### DoD
- [ ] Obispado ve todas las sesiones del barrio
- [ ] Puede abrir cualquier reporte
- [ ] No puede editar
- [ ] Filtro por callingType
- [ ] Build pasa

---

## FASE 6 — Métricas Históricas + Insights

### Objetivo
Tendencias y detección de problemas. Tabla de riesgos.

### Archivos a crear/modificar

| Archivo | Acción |
|---------|--------|
| `teachingAnalyticsService.ts` | Crear — `getWardTeachingStats(wardId, { from, to })` |
| `TeachingAnalyticsPage.tsx` | Crear — KPIs, tabla riesgos |
| `LeadershipCallingsRoutes.tsx` | Añadir `bishop/teaching/analytics` |

### teachingAnalyticsService

```ts
export async function getWardTeachingStats(
  wardId: string,
  range?: { from: number; to: number }
): Promise<{
  avgAttendance: number;
  avgCompletionPct: number;
  top3LowestCompletionParts: { partTitle: string; sessionId: string; pct: number }[];
  activeSessionsNotClosed: { sessionId: string; title: string; hoursOpen: number }[];
  sessionsUnder50Attendance: { sessionId: string; title: string; attendance: number }[];
}>
```
- Lee sesiones del ward en rango
- Por cada sesión completed: buildSessionReport (o query participants count)
- Sesiones active con updatedAt > 24h → activeSessionsNotClosed
- Sesiones con attendance < 50% del esperado (o < 50 si total < 100) → sessionsUnder50Attendance

### TeachingAnalyticsPage
- KPIs: asistencia promedio mensual, % completitud promedio
- Tabla riesgos: sesiones <50% asistencia, sesiones activas >24h
- Gráfica: opcional (lista por semana si no hay chart lib)

### DoD
- [ ] Obispado ve tendencias y focos rojos
- [ ] No se toca flujo en vivo ni /join
- [ ] Build pasa

---

## FASE 7 — Automatizaciones + Recordatorios

### Objetivo
Sistema empuja buenas prácticas. Higiene operativa.

### Componentes

**Cloud Functions (opcional):**
- Cron diario: sesiones activas >24h → notificar maestro
- Sesiones sin partes → alertar
- Al finalizar: recordatorio exportar PDF

**UI (App líderes):**
- Banner en `TeachingSessionsListPage`: "Tienes X sesiones sin cerrar" (sessions con status active del teacher)
- Toast in-app: "Tu sesión sigue abierta. ¿Deseas cerrarla?" (al abrir app si tiene sesión active >24h)

### Archivos a modificar

| Archivo | Acción |
|---------|--------|
| `TeachingSessionsListPage.tsx` | Contar sesiones active del teacher, mostrar banner si > 0 |
| (Nuevo) `useSessionReminders.ts` | Hook: detectar sesión active >24h, mostrar toast/modal |
| (Opcional) `functions/` | Cloud Functions para cron |

### DoD
- [ ] Banner "X sesiones sin cerrar"
- [ ] Toast/nudge al maestro (opcional si no hay backend)
- [ ] No spam

---

## FASE 8 — Calidad + Feedback Post-clase

### Objetivo
Medir calidad sin fricción. Rating y comentarios.

### Modelo Firestore

```
wards/{wardId}/teachingSessions/{sessionId}/feedback/{uid}
  - rating: number (1–5)
  - comment?: string
  - createdAt: number
```

### Reglas Firestore
- create: request.auth.uid == uid, participant exists
- read: teacher or bishopric (ward members)

### Archivos a crear/modificar

| Archivo | Acción |
|---------|--------|
| `feedbackService.ts` | Crear — `submitFeedback`, `getSessionFeedbackSummary` |
| `SessionParticipantLiveView.tsx` | Modal al detectar sesión completed (o post-redirect): "¿Qué tan útil fue?" ⭐ 1-5 + comentario opcional |
| `sessionReportService.ts` | Incluir avgRating, count en reporte |
| `SessionReportPage.tsx` | Mostrar rating promedio |
| `BishopTeachingDashboard.tsx` | KPI "Top sesiones mejor valoradas" |
| `firestore.rules` | Añadir reglas feedback |

### DoD
- [ ] Feedback se guarda
- [ ] Reporte muestra rating promedio
- [ ] Comentarios anonimizados
- [ ] Build pasa

---

## Resumen de dependencias entre fases

- **Fase 5** requiere: listSessionsForWard, BishopricRequiredRoute (o RoleRequiredRoute con roles)
- **Fase 6** requiere: Fase 5 (rutas bishop), teachingAnalyticsService
- **Fase 7** requiere: listSessionsForTeacher (ya existe), TeachingSessionsListPage
- **Fase 8** requiere: subcolección feedback, SessionParticipantLiveView, SessionReportPage

---

## Índices Firestore (por fase)

- **Fase 5:** `wards/{wardId}/teachingSessions` — `updatedAt` desc (puede existir)
- **Fase 6:** Mismo + posiblemente `status`, `updatedAt` para queries de sesiones activas
- **Fase 8:** `feedback` — no requiere índice compuesto para reads por sessionId
