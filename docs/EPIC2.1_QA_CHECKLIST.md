# EPIC 2.1 — Ward Cloud Load Hardening — QA Checklist

## Archivos tocados

| Archivo | Cambios |
|---------|---------|
| `src/state/ward/useWardLoadStatusStore.ts` | **Nuevo** — Store de estado de carga |
| `src/state/ward/wardMembershipCache.ts` | **Nuevo** — Caché localStorage + TTL 7 días |
| `src/state/ward/useWardStore.ts` | Refactor `loadWardMembership`, integración cache/status |
| `src/router/WardRequiredRoute.tsx` | Banners offline/error/loading, botón Reintentar |

---

## 3 pruebas obligatorias

### 1. Online + cloud ok
- **Pasos:** Login → entrar al dashboard
- **Esperado:** Ward carga desde cloud, `source='cloud'`, caché creada en `xtg:wardMembership:{uid}`
- **Verificar:** En DevTools → Application → Local Storage, existe la key

### 2. Offline + cache existe
- **Pasos:** Cargar ward una vez (online). Activar offline en DevTools. Logout y login de nuevo (o recargar).
- **Esperado:** Ward carga desde caché, `source='cache'`, sin pantalla vacía
- **Verificar:** Dashboard muestra barrio correctamente

### 3. Online + cloud falla + sin cache
- **Pasos:** Borrar caché (`xtg:wardMembership:*`), simular error (p. ej. reglas que denieguen) o desconectar Firebase
- **Esperado:** Mensaje claro de error + botón "Reintentar"
- **Verificar:** No redirect a ward-setup; usuario puede reintentar

---

## Pruebas adicionales

- **Cache > 7 días:** Usar caché con `loadedAt` antiguo → banner "Puede estar desactualizado"
- **permission-denied:** Mensaje "No tienes acceso al barrio / tu cuenta no está vinculada"
- **createNewWard / joinWard:** Tras crear/unirse, caché se guarda
