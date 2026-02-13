# Reglas Firestore - Teaching Sessions (Fase 1)

Añadir estas reglas a tu archivo de reglas de Firestore (Firebase Console → Firestore → Rules).

## Reglas para wards/teachingSessions

```javascript
// Añadir dentro de match /databases/{database}/documents {

// Teaching Sessions - sesiones de clase en vivo
match /wards/{wardId}/teachingSessions/{sessionId} {
  // Leer: maestro de la sesión (Fase 2: también participantes registrados)
  allow read: if request.auth != null && (
    resource.data.teacherUid == request.auth.uid
    // Fase 2: || exists(/databases/$(database)/documents/wards/$(wardId)/teachingSessions/$(sessionId)/participants/$(request.auth.uid))
  );
  // Crear: solo maestro (teacherUid debe coincidir)
  allow create: if request.auth != null &&
    request.resource.data.teacherUid == request.auth.uid &&
    request.resource.data.status == 'draft';
  // Actualizar/eliminar: solo maestro
  allow update, delete: if request.auth != null &&
    resource.data.teacherUid == request.auth.uid;
}

// Participants (Fase 2 - preparado, no usado en Fase 1)
match /wards/{wardId}/teachingSessions/{sessionId}/participants/{participantUid} {
  allow read: if request.auth != null && (
    get(/databases/$(database)/documents/wards/$(wardId)/teachingSessions/$(sessionId)).data.teacherUid == request.auth.uid ||
    participantUid == request.auth.uid
  );
  allow create: if request.auth != null && participantUid == request.auth.uid;
  allow update: if request.auth != null && participantUid == request.auth.uid;
  allow delete: if request.auth != null && (
    get(/databases/$(database)/documents/wards/$(wardId)/teachingSessions/$(sessionId)).data.teacherUid == request.auth.uid ||
    participantUid == request.auth.uid
  );
}
```

## Collection Group (Fase 2 - getSessionByJoinCode)

Para buscar sesión por joinCode sin conocer wardId:

```javascript
// Permite leer sesiones activas por joinCode (para /join público)
match /{path=**}/teachingSessions/{sessionId} {
  allow read: if resource.data.status == 'active';
}
```

Nota: Esta regla permite leer cualquier sesión activa. Se usa para el flujo de unión por código. Los datos expuestos (título, maestro) son de baja sensibilidad.

## Feedback (Fase 8)

```javascript
match /wards/{wardId}/teachingSessions/{sessionId}/feedback/{uid} {
  // Lectura: maestro o participante registrado
  allow read: if request.auth != null && (
    get(/databases/$(database)/documents/wards/$(wardId)/teachingSessions/$(sessionId)).data.teacherUid == request.auth.uid ||
    exists(/databases/$(database)/documents/wards/$(wardId)/teachingSessions/$(sessionId)/participants/$(request.auth.uid))
  );
  // Escritura: solo el propio usuario (docId == uid)
  allow create, update: if request.auth != null && request.auth.uid == uid;
  allow delete: if false;
}
```

## Índices compuestos requeridos

1. **listSessionsForTeacher**: `wards/{wardId}/teachingSessions` — `teacherUid` (Asc), `updatedAt` (Desc)

2. **getSessionByJoinCode** (collection group): Colección group `teachingSessions` — `joinCode` (Asc), `status` (Asc). Firestore sugerirá el índice al ejecutar la query.
