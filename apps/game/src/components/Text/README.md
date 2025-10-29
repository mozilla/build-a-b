# Text Component

A comprehensive, type-safe Text component that maps directly to the Figma typography design system for the Data War game.

## Features

- 🎨 **Figma-aligned variants** - Typography styles that match the Figma design system
- 🔤 **Polymorphic rendering** - Render as any HTML element or React component
- 💪 **Type-safe** - Full TypeScript support with intelligent autocomplete
- 🎭 **Flexible styling** - Override weight, alignment, transform, and more
- ✂️ **Text utilities** - Built-in support for truncation and line clamping
- 🎯 **Composable** - Combine multiple props for precise control

## Usage

### Basic Usage

```tsx
import { Text } from '@/components/Text';

// Simple title
<Text variant="title-2">Battle for Data Supremacy!</Text>

// Body text
<Text variant="body-large-semibold">
  This is the digital version of Data War
</Text>

// Label
<Text variant="label-uppercase">32 Cards left</Text>
```

### Custom HTML Elements

Use the `as` prop to render as any HTML element:

```tsx
// Render as h1
<Text as="h1" variant="title-1">Page Title</Text>

// Render as span
<Text as="span" variant="body-small">Inline text</Text>

// Render as div
<Text as="div" variant="body-medium">Container text</Text>
```

### Styling Overrides

Override default styles with additional props:

```tsx
// Override font weight
<Text variant="title-3" weight="medium">
  Medium Weight Title
</Text>

// Center align
<Text variant="body-large" align="center">
  Centered text
</Text>

// Italic
<Text variant="body-medium" italic>
  Italic text
</Text>

// Transform
<Text variant="body-large" transform="uppercase">
  Uppercase text
</Text>

// Custom color
<Text variant="title-2" color="text-accent">
  Accented title
</Text>
```

### Text Utilities

```tsx
// Truncate with ellipsis
<Text variant="body-medium" truncate>
  This is a very long text that will be truncated with an ellipsis when it exceeds the container width
</Text>

// Line clamp (limit to N lines)
<Text variant="body-small" lineClamp={3}>
  This text will be clamped to exactly 3 lines with an ellipsis at the end, perfect for preview cards and content snippets
</Text>
```

### Combined Props

Mix and match props for precise control:

```tsx
<Text
  as="h2"
  variant="title-3"
  weight="semibold"
  align="center"
  color="text-secondary-blue"
  className="mb-4"
>
  Custom Styled Title
</Text>
```

## Typography Variants

All variants are based on the Figma design system and use Sharp Sans font family.

### Titles

| Variant   | Font Size | Line Height | Weight    | Usage                      |
| --------- | --------- | ----------- | --------- | -------------------------- |
| `title-1` | 36px      | 40px        | Extrabold | Main page titles           |
| `title-2` | 30px      | 36px        | Extrabold | Section headers            |
| `title-3` | 24px      | 32px        | Extrabold | Subsection headers         |
| `title-4` | 20px      | 28px        | Extrabold | Card titles, small headers |
| `title-5` | 16px      | 24px        | Extrabold | Minor titles               |

### Body Text

| Variant                | Font Size | Line Height | Weight   | Usage                 |
| ---------------------- | --------- | ----------- | -------- | --------------------- |
| `body-large-semibold`  | 18px      | 24px        | Semibold | Emphasized large text |
| `body-large-medium`    | 18px      | 24px        | Medium   | Large body text       |
| `body-large`           | 18px      | 24px        | Regular  | Standard large text   |
| `body-medium-semibold` | 16px      | 24px        | Semibold | Emphasized body text  |
| `body-medium`          | 16px      | 24px        | Regular  | Standard body text    |
| `body-small-medium`    | 14px      | 20px        | Medium   | Small descriptions    |
| `body-small`           | 14px      | 20px        | Regular  | Compact text          |
| `body-xs`              | 12px      | 16px        | Regular  | Tiny text, captions   |

### Labels

| Variant           | Font Size | Line Height | Weight    | Special                | Usage               |
| ----------------- | --------- | ----------- | --------- | ---------------------- | ------------------- |
| `label-uppercase` | 8px       | Normal      | Extrabold | Uppercase, 8% tracking | Small status labels |
| `label-medium`    | 12px      | 16px        | Medium    | -                      | Standard labels     |
| `label-semibold`  | 12px      | 16px        | Semibold  | -                      | Emphasized labels   |

### Display

| Variant          | Font Size | Line Height | Weight    | Special                           | Usage               |
| ---------------- | --------- | ----------- | --------- | --------------------------------- | ------------------- |
| `display-large`  | 76px      | Normal      | Extrabold | Italic, Uppercase, -1.5% tracking | "Data War" logo     |
| `display-medium` | 60px      | None        | Extrabold | -                                 | Large display text  |
| `display-small`  | 48px      | None        | Extrabold | -                                 | Medium display text |

## Font Weights

Available font weights (use with `weight` prop):

- `thin` - 100
- `light` - 300
- `regular` - 400 (default for body text)
- `medium` - 500
- `semibold` - 600
- `bold` - 700
- `extrabold` - 800 (default for titles)

## Text Alignment

Use with `align` prop:

- `left` (default)
- `center`
- `right`
- `justify`

## Text Transform

Use with `transform` prop:

- `none` (default)
- `uppercase`
- `lowercase`
- `capitalize`

## Real-World Examples

### Welcome Screen Title

```tsx
<Text variant="title-2" align="center">
  Battle for Data Supremacy!
</Text>
```

### Description Text

```tsx
<Text variant="body-large-semibold" align="center">
  This is the digital version of{' '}
  <Text as="span" italic>
    Data War
  </Text>
  , a game of Billionaire brinksmanship where space is the place, data is the currency, and chaos
  reigns.
</Text>
```

### Quick Launch Guide Step

```tsx
<div className="space-y-2">
  <Text variant="title-4">Tap stack to start!</Text>
  <Text variant="body-small-medium">
    Whoever has the most data points at the end of the hand wins all the played cards, including
    Launch Stacks.
  </Text>
</div>
```

### Menu Item

```tsx
<Text variant="title-3" as="button" className="cursor-pointer">
  📖 Quick Launch Guide
</Text>
```

### Status Label

```tsx
<Text variant="label-uppercase">32 Cards left</Text>
```

### Data War Logo

```tsx
<Text variant="display-large" align="center">
  Data War
</Text>
```

## Accessibility

- Uses semantic HTML elements by default (`<p>`)
- Can be customized to use appropriate heading levels with the `as` prop
- Maintains readable contrast ratios with the default ash color (#f8f6f4)
- Supports all standard HTML attributes for enhanced accessibility

## TypeScript Support

The component is fully typed with intelligent autocomplete:

```tsx
import type { TextVariant, FontWeight, TextAlign, TextTransform } from '@/components/Text/types';

// All props are type-checked
const variant: TextVariant = 'title-2'; // ✅
const weight: FontWeight = 'extrabold'; // ✅
const align: TextAlign = 'center'; // ✅
```

## Styling System

The component uses Tailwind CSS classes and respects the project's design tokens:

- Colors: `text-common-ash` (default), `text-accent`, `text-secondary-blue`, etc.
- Font family: `font-sharp-sans` (Sharp Sans)
- Responsive: All font sizes are responsive using the project's viewport-based system

## Migration from Existing Code

If you have existing text elements, you can easily migrate them:

```tsx
// Before
<h1 className="text-3xl font-extrabold text-center">Title</h1>

// After
<Text as="h1" variant="title-2" align="center">Title</Text>

// Before
<p className="text-lg font-semibold">Description</p>

// After
<Text variant="body-large-semibold">Description</Text>
```

## Notes

- The component automatically applies the Sharp Sans font family
- Default text color is common-ash (#f8f6f4)
- All variants are designed for the mobile-first approach
- The component is optimized for the game's visual design system
