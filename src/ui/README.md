# UI Kit / Design System

This directory contains the unified UI Kit and Design System for the entire application. All roles (learning, serving, vineyard) now share the same visual language.

## Structure

```
src/ui/
├── design-system/  # Design tokens and CSS variable generator
├── components/     # Reusable UI components
│   ├── primitives/ # Box, Flex, Stack, Text, Heading, etc.
│   ├── Layout/     # Page structure components
│   ├── Navigation/ # Navigation components
│   ├── Controls/   # Interactive controls
│   ├── Feedback/   # Progress and status indicators
│   └── Content/    # Content display components
└── README.md       # This file
```

## Design System Tokens

All design tokens are in `src/ui/design-system/` and exposed as CSS variables in `src/styles/design-system.css`:

- **tokens.ts**: Single source of truth (colors, typography, spacing, radius, shadows)
- **generate-css-variables.ts**: Generates CSS from tokens

### Usage

```typescript
import { theme, designTokens } from '@/ui';

// Access tokens (theme is alias of designTokens)
const primaryColor = theme.colors.primary.DEFAULT;
const padding = theme.spacing[4];

// Prefer CSS variables in components
style={{ color: 'var(--color-primary-default)', padding: 'var(--spacing-4)' }}
```

### Cambiar la paleta de colores

Para usar otro estilo manteniendo el mismo diseño (esquinas redondeadas, sombras, tipografía):

1. **Edita** `src/ui/design-system/tokens.ts`: en `colors.primary`, `colors.secondary` y `colors.accent` cambia los valores hex (50, 100, 500, 600, 900, DEFAULT, light, dark).
2. **Sincroniza** `src/styles/design-system.css`: actualiza el bloque `:root` con los mismos hex para `--color-primary-*`, `--color-secondary-*` y `--color-accent-*`.

Los componentes que usan `var(--color-primary-default)` y similares tomarán la nueva paleta. La actual usa **teal** como primario y **ámbar** como acento.

## Components

### Layout Components

- **PageContainer**: Main page wrapper with consistent padding and max-width
- **Section**: Content section with optional title and subtitle
- **Card**: Flexible card component with variants (default, elevated, outlined, gradient)
- **TwoColumnLayout**: Responsive two-column layout

### Navigation Components

- **TabBar**: Bottom navigation bar
- **TopBar**: Top header bar with title, subtitle, and actions
- **RoleBadge**: Badge displaying user role

### Controls Components

- **ButtonPrimary**: Primary action button with gradient
- **ButtonSecondary**: Secondary button with outline style
- **IconButton**: Icon-only button with variants

### Feedback Components

- **ProgressBar**: Progress indicator with variants and sizes
- **LevelCard**: Level display card with XP progress
- **StatPill**: Statistic display pill
- **EmptyState**: Empty state message component

### Content Components

- **LessonCard**: Lesson display card with progress
- **ActivityCard**: Activity display card
- **CommitCard**: Commitment/task card
- **PersonCard**: Person/contact card
- **DevotionalCard**: Daily devotional card

## Usage Example

```typescript
import {
  PageContainer,
  TopBar,
  Card,
  Section,
  ProgressBar,
  LessonCard,
  ButtonPrimary,
} from '../../ui/components';

export const MyPage: React.FC = () => {
  return (
    <PageContainer>
      <TopBar title="My Page" subtitle="Subtitle" />

      <Section title="Lessons">
        <LessonCard
          id="1"
          title="Lesson 1"
          description="Learn the basics"
          progress={75}
          to="/lessons/1"
        />
      </Section>

      <Card variant="gradient">
        <h2>Progress</h2>
        <ProgressBar value={75} variant="primary" />
      </Card>

      <ButtonPrimary onClick={() => console.log('Clicked')}>
        Start Learning
      </ButtonPrimary>
    </PageContainer>
  );
};
```

## Component Props

All components accept:

- `className?: string` - Additional CSS classes
- Standard HTML attributes where applicable

Components are fully typed with TypeScript for type safety.

## Styling

Components use CSS variables defined in `src/styles/global.css` for consistency. The theme tokens are also available as CSS variables:

- `--color-primary`, `--color-primary-light`, etc.
- `--font-size-xs`, `--font-size-sm`, etc.
- `--spacing-xs`, `--spacing-sm`, etc.
- `--border-radius-sm`, `--border-radius-md`, etc.
- `--shadow-sm`, `--shadow-md`, etc.

## Best Practices

1. **Always use UI Kit components** instead of creating custom styled components
2. **Use theme tokens** for spacing, colors, and typography
3. **Maintain consistency** across all roles by using the same components
4. **Extend with className** when you need custom styling, but prefer component props first
5. **Keep business logic separate** - components are purely presentational

## Migration Guide

When refactoring existing pages:

1. Replace custom containers with `PageContainer`
2. Replace custom headers with `TopBar`
3. Replace custom cards with `Card` component
4. Replace custom buttons with `ButtonPrimary` or `ButtonSecondary`
5. Replace custom progress bars with `ProgressBar`
6. Use `Section` for content sections
7. Use appropriate content components (`LessonCard`, `ActivityCard`, etc.)
