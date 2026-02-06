# xTheGospel Leaders

Aplicación para líderes de barrio y estaca de La Iglesia de Jesucristo de los Santos de los Últimos Días.

## 🔗 Proyecto Firebase Compartido

Esta aplicación **comparte el mismo proyecto Firebase** con la app de miembros (xthegospel).
Esto permite:

- **Autenticación compartida**: Un usuario usa la misma cuenta en ambas apps
- **Datos interconectados**: Los líderes pueden acceder a información de miembros
- **Sincronización futura**: Cambios reflejados en tiempo real entre apps

## Características

- **Dashboard de Liderazgo**: Vista general de llamamientos y recordatorios
- **Gestión de Llamamientos**: Crear, editar y dar seguimiento a llamamientos
- **Calendario**: Eventos y reuniones de liderazgo
- **Miembros**: Lista y perfiles de miembros del barrio/estaca
- **Notas**: Notas privadas de liderazgo
- **Responsabilidades**: Asignación y seguimiento de responsabilidades

## Requisitos

- Node.js 18+
- npm o yarn
- Proyecto Firebase (el mismo de xthegospel miembros)

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar Firebase (usar las MISMAS credenciales de xthegospel miembros)
cp .env.example .env.local
```

### Configurar `.env.local`

Copia las credenciales de tu proyecto Firebase de xthegospel:

```env
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=tu-app-id
```

> 💡 **Tip**: Puedes encontrar estas credenciales en la consola de Firebase:
> Project Settings → General → Your apps → Firebase SDK snippet

## Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev
```

La aplicación se abrirá en http://localhost:5173

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Desarrollo con hot reload |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |
| `npm run lint` | Verificar tipos TypeScript |

## Estructura del Proyecto

```
src/
├── features/
│   ├── auth/                    # Login, Registro, Perfil
│   └── leadershipCallings/      # Módulo principal
│       ├── pages/               # Páginas/vistas
│       ├── state/               # Zustand stores
│       ├── types/               # Tipos TypeScript
│       └── data/                # Datos mock (solo dev)
├── ui/                          # Sistema de diseño
├── context/                     # React Context (Auth, i18n)
├── services/                    # Servicios (Firebase)
├── router/                      # Rutas protegidas
├── config/                      # Configuración
└── i18n/                        # Traducciones (ES/EN)
```

## Arquitectura de Datos

La estructura de Firestore está diseñada para permitir interconexión futura:

```
users/{uid}/
├── profile/                     # Perfil compartido
├── member_data/                 # Datos de app miembros
└── leader_data/                 # Datos de app líderes
    ├── leadership_callings/
    ├── leadership_responsibilities/
    ├── leadership_notes/
    ├── leadership_events/
    └── leadership_observations/
```

Ver [docs/FIREBASE_SCHEMA.md](docs/FIREBASE_SCHEMA.md) para más detalles.

## Seguridad

- **Local-first**: Los datos funcionan sin conexión
- **Cloud sync opcional**: Activar con `VITE_CLOUD_SYNC_ENABLED=true`
- **Sin métricas intrusivas**: Respeto a la dignidad de los miembros
- **Notas privadas**: Solo el líder puede ver sus notas

## Licencia

Privado - xTheGospel Project
