# xTheGospel Leaders

Aplicación para líderes de barrio y estaca de La Iglesia de Jesucristo de los Santos de los Últimos Días.

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

## Instalación

```bash
# Instalar dependencias
npm install

# Copiar archivo de configuración de Firebase
cp .env.example .env.local
# Editar .env.local con tus credenciales de Firebase
```

## Desarrollo

### Web (Vite)

```bash
npm run dev
```

La aplicación se abrirá en http://localhost:3002

### Móvil (Expo)

```bash
npm start
# o
npm run android
npm run ios
```

## Firebase

Esta aplicación comparte el proyecto Firebase con la app principal de xTheGospel.
Asegúrate de configurar las mismas credenciales en `.env.local`.

## Estructura del Proyecto

```
src/
├── features/
│   └── leadershipCallings/  # Módulo principal
│       ├── pages/           # Páginas/vistas
│       ├── state/           # Zustand stores
│       ├── types/           # Tipos TypeScript
│       └── data/            # Datos mock
├── ui/                      # Sistema de diseño
├── context/                 # React Context (Auth, i18n)
├── services/                # Servicios (Firebase)
├── router/                  # Rutas web
├── layouts/                 # Layouts
├── config/                  # Configuración
└── i18n/                    # Traducciones
```

## Scripts

- `npm run dev` - Desarrollo web
- `npm run build` - Build de producción
- `npm start` - Iniciar Expo
- `npm run android` - Ejecutar en Android
- `npm run ios` - Ejecutar en iOS
