# Fase 5 — Checklist Técnico por Archivos (Ejecutable en una pasada)

## 1. teachingSessionsService.ts

**Añadir función:**
```ts
export async function listSessionsForWard(
  wardId: string,
  options?: { limit?: number; callingType?: CallingType; daysBack?: number }
): Promise<TeachingSession[]>
```

- Query: `collection(wards, wardId, teachingSessions)`
- Si `callingType`: `where('callingType', '==', callingType)`
- Si `daysBack`: `where('updatedAt', '>=', Date.now() - daysBack * 24 * 60 * 60 * 1000)`
- Siempre: `orderBy('updatedAt', 'desc')`, `limit(options?.limit ?? 50)`
- **Índice:** Si usas callingType + updatedAt, crear índice compuesto. Si solo updatedAt, puede funcionar con índice simple.

---

## 2. BishopricRequiredRoute.tsx (NUEVO)

**Crear:** `src/router/BishopricRequiredRoute.tsx`

```tsx
// Wrapper que requiere rol bishopric (obispo, consejeros, secretario).
// Redirige a / si no es bishopric.
```

- Usar `useUserRoleStore().isBishopric()`
- Si false → `<Navigate to="/" replace />`
- Si true → `<Outlet />` (para rutas anidadas)

---

## 3. BishopTeachingDashboard.tsx (NUEVO)

**Crear:** `src/features/teachingSessions/pages/BishopTeachingDashboard.tsx`

**Datos:**
- `useWardStore().membership?.wardId`
- `listSessionsForWard(wardId, { limit: 50, daysBack: 30, callingType })`
- Para asistencia por sesión: llamar `buildSessionReport` al hacer click en "Ver reporte", o pre-cargar. **Opción simple:** no mostrar asistencia en lista, solo en reporte.

**KPIs (simplificado Fase 5):**
- Total sesiones: `sessions.length`
- Asistencia promedio: requiere reportes — **dejar para Fase 6** o calcular con `getDocs(participants)` por sesión (costoso). Alternativa: "Ver reporte" para ver asistencia.
- % completitud: igual, Fase 6.

**KPIs Fase 5 (mínimo):**
- Total sesiones (30 días)
- Sesiones activas vs completadas (count)

**UI:**
- Filtro: `<select>` callingType (todas, Escuela Dominical, Seminario, etc.)
- Lista: título, estado (draft/active/completed), fecha, botón "Ver reporte"
- Botón "Ver reporte" → `navigate(\`/bishop/teaching/${sessionId}/report\`)`

---

## 4. LeadershipCallingsRoutes.tsx

**Añadir rutas (dentro de LeadershipCallingsLayout):**
```tsx
<Route path="bishop/teaching" element={<BishopTeachingDashboard />} />
<Route path="bishop/teaching/:sessionId/report" element={<SessionReportPage />} />
```

**Guard bishopric:**
- Opción A: Crear layout `<BishopricLayout>` que envuelve con BishopricRequiredRoute
- Opción B: Cada ruta con `element={<BishopricRequiredRoute><BishopTeachingDashboard /></BishopricRequiredRoute>}`

**BishopricRequiredRoute** debe usar `<Outlet />` si es layout padre, o recibir children. Para rutas planas:
```tsx
<Route path="bishop/teaching" element={<BishopricRequiredRoute><BishopTeachingDashboard /></BishopricRequiredRoute>} />
<Route path="bishop/teaching/:sessionId/report" element={<BishopricRequiredRoute><SessionReportPage /></BishopricRequiredRoute>} />
```

---

## 5. pages/index.ts

```ts
export { default as BishopTeachingDashboard } from './BishopTeachingDashboard';
```

---

## 6. Navegación al dashboard del obispado

**Añadir enlace** en LeadershipCallingsLayout o Dashboard para usuarios bishopric:
- "Clases del barrio" → `/bishop/teaching`

---

## 7. SessionReportPage — reutilizable

- Ya existe y recibe `sessionId` por params.
- La ruta `bishop/teaching/:sessionId/report` usa el mismo componente.
- SessionReportPage usa `membership?.wardId` — el obispado tiene ward, así que funciona.

---

## Orden de implementación sugerido

1. `listSessionsForWard` en teachingSessionsService
2. `BishopricRequiredRoute.tsx`
3. `BishopTeachingDashboard.tsx`
4. Rutas en LeadershipCallingsRoutes
5. Export en pages/index.ts
6. Enlace en layout/dashboard (opcional, puede ir en Fase 5b)

---

## DoD Fase 5

- [ ] `listSessionsForWard` funciona
- [ ] BishopricRequiredRoute redirige no-bishopric
- [ ] BishopTeachingDashboard muestra sesiones del ward
- [ ] Filtro por callingType
- [ ] "Ver reporte" abre SessionReportPage
- [ ] Build pasa
