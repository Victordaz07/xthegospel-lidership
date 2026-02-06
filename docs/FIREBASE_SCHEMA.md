# Esquema de Firebase - xTheGospel Ecosystem

Este documento describe la estructura de datos en Firestore que permite
la interconexión entre la app de **Miembros** y la app de **Líderes**.

## Proyecto Firebase Compartido

Ambas aplicaciones usan el **mismo proyecto Firebase**, lo que permite:

- ✅ Autenticación compartida (mismo usuario en ambas apps)
- ✅ Datos interconectados (líderes pueden ver info de miembros)
- ✅ Un solo billing/proyecto que administrar
- ✅ Reglas de seguridad centralizadas

## Estructura de Colecciones

```
firestore/
│
├── users/                          # Datos de usuarios (compartido)
│   └── {uid}/
│       ├── profile/                # Perfil del usuario
│       │   └── data                # nombre, email, foto, wardId, stakeId
│       │
│       ├── member_data/            # Datos de la app de MIEMBROS
│       │   ├── progress/           # Progreso personal
│       │   ├── goals/              # Metas personales
│       │   └── devotionals/        # Devocionales guardados
│       │
│       └── leader_data/            # Datos de la app de LÍDERES
│           ├── leadership_callings/
│           ├── leadership_responsibilities/
│           ├── leadership_notes/
│           ├── leadership_events/
│           └── leadership_observations/
│
├── wards/                          # Datos de barrios (futuro)
│   └── {wardId}/
│       ├── info                    # Nombre, estaca, etc.
│       ├── members/                # Lista de miembros
│       └── callings/               # Llamamientos del barrio
│
└── stakes/                         # Datos de estacas (futuro)
    └── {stakeId}/
        ├── info
        └── wards/
```

## Colecciones Actuales (v1)

### App de Líderes - Estructura Actual

```
users/{uid}/leadership_callings/{id}
├── id: string
├── memberId: string              ← Puede referenciar a otro usuario
├── memberName: string
├── organization: string
├── position: string
├── status: 'proposed' | 'called' | 'sustained' | 'set_apart' | 'active' | 'released'
├── timeline: { proposedAt, calledAt, sustainedAt, setApartAt, releasedAt }
├── notes: string
├── createdAt: timestamp
├── updatedAt: timestamp
└── schemaVersion: 'v1'

users/{uid}/leadership_responsibilities/{id}
├── id: string
├── callingId: string             ← Referencia a un calling
├── title: string
├── description: string
├── status: 'pending' | 'in_progress' | 'done'
├── priority: 'low' | 'medium' | 'high'
├── suggestedDate: string
├── createdAt: timestamp
└── updatedAt: timestamp

users/{uid}/leadership_notes/{id}
├── id: string
├── scope: 'calling' | 'member' | 'organization' | 'general'
├── scopeId: string               ← ID del calling/member/org
├── type: 'reflection' | 'followup' | 'idea' | 'concern'
├── content: string
├── isDictated: boolean
├── createdAt: timestamp
└── updatedAt: timestamp

users/{uid}/leadership_events/{id}
├── id: string
├── kind: 'interview' | 'training' | 'meeting' | 'visit' | 'other'
├── title: string
├── date: string (YYYY-MM-DD)
├── time: string (HH:mm)
├── callingId?: string
├── memberId?: string
├── organization?: string
├── notes: string
├── createdAt: timestamp
└── updatedAt: timestamp

users/{uid}/leadership_observations/{id}
├── id: string
├── callingId: string
├── content: string               ← Observación narrativa (NO métricas)
├── milestone?: string
├── createdAt: timestamp
└── schemaVersion: 'v1'
```

## Interconexión Futura

### Caso de Uso: Líder ve progreso de un miembro

```javascript
// 1. Líder tiene un calling con memberId
const calling = await getDoc(doc(db, `users/${leaderUid}/leadership_callings/${callingId}`));
const memberId = calling.data().memberId;

// 2. Con permisos apropiados, puede acceder al perfil del miembro
const memberProfile = await getDoc(doc(db, `users/${memberId}/profile/data`));

// 3. O ver su progreso (requiere reglas de seguridad)
const memberProgress = await getDoc(doc(db, `users/${memberId}/member_data/progress`));
```

### Caso de Uso: Sincronizar llamamientos con el barrio

```javascript
// Futuro: Cuando exista la colección de barrios
const wardCallings = collection(db, `wards/${wardId}/callings`);
// Los llamamientos se sincronizan bidireccionalmente
```

## Reglas de Seguridad (Firestore Rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Usuarios pueden leer/escribir sus propios datos
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Futuro: Líderes pueden leer datos de miembros de su barrio
    // match /users/{userId}/profile/data {
    //   allow read: if isLeaderOfSameWard(request.auth.uid, userId);
    // }
    
    // Futuro: Datos de barrio accesibles por miembros del barrio
    // match /wards/{wardId}/{document=**} {
    //   allow read: if isMemberOfWard(request.auth.uid, wardId);
    //   allow write: if isLeaderOfWard(request.auth.uid, wardId);
    // }
  }
}
```

## Migración y Compatibilidad

- **v1 (actual)**: Datos aislados por usuario en `users/{uid}/leadership_*`
- **v2 (futuro)**: Agregar `wardId` a usuarios y crear colección `wards/`
- **v3 (futuro)**: Agregar roles y permisos granulares

La estructura actual es compatible con futuras expansiones sin necesidad
de migrar datos existentes.
