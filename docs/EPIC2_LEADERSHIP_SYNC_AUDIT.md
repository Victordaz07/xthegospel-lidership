# Auditoría EPIC 2 — leadershipSync.ts + leadershipCloudService

> Revisión quirúrgica: idempotencia, duplicados, batch writes, reglas Firestore.

---

## 1. leadershipSync.ts — Contenido actual

```typescript
// (Ver archivo: src/features/leadershipCallings/state/sync/leadershipSync.ts)
// Resumen: syncLeadershipToCloud, hydrateLeadershipFromCloud, forceHydrateLeadershipFromCloud
```

---

## 2. Idempotencia del upsert

**Estado:** ✅ Idempotente.

- `upsertCalling(uid, calling)` usa `setDoc(..., { merge: true })` → crea o actualiza por `calling.id`.
- Mismo patrón para responsibilities, notes, events, observations.
- No hay riesgo de duplicados: el `id` del item local es la clave del documento.

---

## 3. Riesgos de duplicados

**Estado:** ✅ Sin riesgo.

- Los IDs se generan en frontend (`calling-${Date.now()}`, `note-${Date.now()}`, etc.).
- Al hidratar desde cloud, los docs vienen con su `id` de Firestore (`docSnap.id`).
- Al sincronizar de vuelta, se usa ese mismo `id` → mismo doc path.
- **Caso edge:** Si dos dispositivos crean items con el mismo timestamp (muy improbable) → colisión de ID. Mitigación futura: UUID v4 en lugar de `Date.now()`.

---

## 4. Cuota y batch writes

**Estado:** ⚠️ Mejorable (EPIC 2.5).

- Actualmente: `Promise.all([...callings.map(upsert), ...responsibilities.map(...), ...])` → **N writes** (uno por item).
- Firestore cobra por documento escrito. Con 50 callings + 30 notes + 20 events = 100+ writes por sync.
- **Recomendación futura:** `writeBatch()` para agrupar hasta 500 ops por batch. Mismo costo, pero menos round-trips.
- **No urgente:** Funciona bien para volúmenes típicos de liderazgo (< 100 items).

---

## 5. Reglas Firestore — Campos requeridos

**Riesgo:** Las reglas exigen `isValidString(request.resource.data.X, N)`. Si un campo es `undefined`, falla.

| Colección | Campos exigidos | Riesgo |
|-----------|-----------------|--------|
| leadership_callings | memberName, position | `notes` es opcional en Calling; memberName/position son requeridos en tipo |
| leadership_responsibilities | title, description | Revisar si hay defaults |
| leadership_notes | content | OK |
| leadership_events | title, description | Revisar si hay defaults |
| leadership_observations | content, milestone | Revisar si hay defaults |

**Acción recomendada:** En `leadershipCloudService.ensureSchema` o en los upserts, asegurar que campos exigidos por rules tengan `""` si vienen undefined:

```typescript
// Ejemplo para calling:
const data = {
  ...calling,
  memberName: calling.memberName ?? '',
  position: calling.position ?? '',
  // ...
};
```

---

## 6. Logout con timer pendiente

**Estado:** ✅ Cubierto.

- Al hacer logout, el usuario navega fuera del dashboard → `LeadershipSyncBridge` se desmonta.
- El `useEffect` cleanup cancela las suscripciones y el `useDebouncedSync` cleanup cancela el timeout.
- `syncLeadershipToCloud()` ya valida `getCurrentUser()` y retorna early si no hay user.

---

## 7. Fix aplicado: isHydrating

- `useSyncStatusStore` ahora tiene `isHydrating` y `setHydrating`.
- Durante `hydrateLeadershipFromCloud` y `forceHydrateLeadershipFromCloud` → `isHydrating=true`.
- `scheduleSync()` no dispara autosync si `isHydrating` es true.
- Evita el loop: hydrate → setState → subscribe → sync innecesario.

---

## 8. Debounce global

**Estado:** ✅ Correcto.

- Un solo `scheduleSync()` compartido por los 5 stores.
- Un solo `timeoutRef` → un solo timer.
- Múltiples cambios en < 1s → 1 sync.

---

## 9. Error auto-clear

**Estado:** ✅ Correcto.

- `setSyncing()` → `errorMessage: null`.
- `setSuccess()` → `errorMessage: null`.
- El siguiente sync exitoso borra el banner de error.

---

## 10. Checklist QA (recordatorio)

- [ ] Hydrate no triggea sync (store vacío → hidrata → espera 2s → no sync)
- [ ] Force hydrate sobrescribe local
- [ ] Error recuperable (banner desaparece en próximo sync ok)
- [ ] Dos writes rápidos → 1 sync
- [ ] Logout con timer → no sync sin user
