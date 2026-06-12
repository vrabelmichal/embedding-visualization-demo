# AI Agents Guide for Interactive Embedding Visualization

This document provides guidance for AI coding agents (GitHub Copilot, Cursor, etc.) working on this project.

## Project Overview

**Purpose:** High-performance web-based visualization for exploring 2D UMAP embeddings of astronomical objects (low surface brightness galaxies).

**Tech Stack:** Vite + React + TypeScript + Tailwind CSS + deck.gl

**Key Features:**
- Interactive scatter plot with 50k+ point capacity
- Custom marker shapes (star, circle, hexagon, etc.)
- Shape-clipped image tooltips on hover
- Property details panel on click
- Fixed-position legend with color scale
- Mobile-first responsive design

---

## Project Structure

```
src/
├── components/          # React UI components
│   ├── EmbeddingViewer.tsx       # Main container
│   ├── ScatterPlot.tsx           # deck.gl visualization
│   ├── ImageTooltip.tsx          # Hover image (shape-clipped)
│   ├── DetailPanel.tsx           # Property details modal
│   ├── Legend.tsx                # Fixed-position legend
│   ├── ColorScale.tsx            # Color gradient display
│   ├── ShapeLegend.tsx           # Shape reference
│   └── Controls.tsx              # UI controls
├── hooks/               # Custom React hooks
│   ├── useDataLoader.ts          # CSV/JSON data loading
│   ├── useViewState.ts           # Pan/zoom state
│   ├── useColorMapping.ts        # Color calculations
│   ├── useShapeMapping.ts        # Shape validation
│   └── useImagePreload.ts        # Image caching
├── utils/               # Utility functions
│   ├── types.ts                  # TypeScript interfaces
│   ├── dataLoader.ts             # Data parsing
│   ├── colorMapper.ts            # Color scale generation
│   ├── shapeRenderer.ts          # Shape SVG paths
│   └── gestureHandlers.ts        # Mobile gestures
└── store/               # State management
    └── visualizationStore.ts     # Zustand store
```

---

## Key Concepts

### 1. Data Schema

```typescript
type EmbeddingShape = 
  | 'star' | 'triangle' | 'square' | 'pentagon' 
  | 'hexagon' | 'polygon' | 'diamond' | 'circle' | 'rectangle';

interface AstronomicalObject {
  coadd_object_id: string;        // Unique identifier
  embedding_x: number;             // X-coordinate
  embedding_y: number;             // Y-coordinate
  image_url: string;               // Cutout image URL
  color?: string;                  // Optional hex color
  embedding_shape?: EmbeddingShape; // Optional shape
  [key: string]: any;              // Additional properties
}

interface ColorMapping {
  column?: string;                 // Property to color by
  scale: 'linear' | 'log' | 'quantile' | 'categorical';
  colorScheme: string;             // e.g., 'viridis', 'plasma'
  domain?: [number, number];       // Min/max values
}
```

### 2. Color Priority Logic
```
1. If object.color exists → use it directly
2. Else if colorMapping.column specified → compute from column
3. Else → use default (#4299e1)
```

### 3. Shape Priority Logic
```
1. If object.embedding_shape is valid → use it
2. Else → use 'rectangle' (default)
```

---

## Implementation Guidelines

### When Creating Components

**Always:**
- ✅ Use TypeScript with proper type annotations
- ✅ Import types from `utils/types.ts`
- ✅ Use Tailwind CSS for styling
- ✅ Make components responsive (mobile-first)
- ✅ Add proper ARIA labels for accessibility
- ✅ Use React.memo for expensive components
- ✅ Handle loading and error states

**Never:**
- ❌ Use `any` type (except in `[key: string]: any` for flexible properties)
- ❌ Hardcode colors (use Tailwind classes or theme)
- ❌ Ignore mobile viewport
- ❌ Skip error handling

**Example Component Structure:**
```tsx
import React from 'react';
import type { AstronomicalObject } from '@/utils/types';

interface Props {
  data: AstronomicalObject[];
  onSelect?: (obj: AstronomicalObject) => void;
}

export const MyComponent = React.memo<Props>(({ data, onSelect }) => {
  // Component logic
  
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Component JSX */}
    </div>
  );
});

MyComponent.displayName = 'MyComponent';
```

### When Working with deck.gl

**Key Points:**
- Use `IconLayer` for custom shapes (not `ScatterplotLayer`)
- Pre-generate shape textures once at startup
- Configure touch gestures properly for mobile
- Handle `onHover` and `onClick` events
- Set appropriate `pickingRadius` for touch

**Example IconLayer:**
```typescript
import { IconLayer } from '@deck.gl/layers';

new IconLayer({
  id: 'scatter-plot',
  data: objects,
  getIcon: d => d.embedding_shape || 'rectangle',
  getPosition: d => [d.embedding_x, d.embedding_y],
  getColor: d => hexToRgb(d.color || defaultColor),
  getSize: 20,
  pickable: true,
  onHover: handleHover,
  onClick: handleClick,
  iconAtlas: shapeAtlas,  // Pre-generated texture atlas
  iconMapping: shapeMapping
})
```

### When Implementing Image Clipping

**Use CSS clip-path for hardware acceleration:**
```tsx
const clipPaths = {
  circle: 'circle(50%)',
  star: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
  hexagon: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  diamond: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  triangle: 'polygon(50% 0%, 0% 100%, 100% 100%)',
  // ... etc
};

<img 
  src={object.image_url}
  style={{ clipPath: clipPaths[object.embedding_shape || 'rectangle'] }}
  className="w-full h-full object-cover"
/>
```

### When Building the Legend

**Requirements:**
- Fixed position (default: `top-4 right-4`)
- Semi-transparent background
- Show color scale when using column-based coloring
- Show shape reference when 2+ shapes in dataset
- Toggle visibility
- Responsive (center on mobile)

**Example:**
```tsx
<div className="fixed top-4 right-4 max-md:top-4 max-md:left-1/2 max-md:-translate-x-1/2
                bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm
                rounded-lg shadow-lg p-4 max-w-xs border border-gray-200">
  {/* Color scale section */}
  {showColorScale && <ColorScale {...colorMapping} />}
  
  {/* Shape legend section */}
  {uniqueShapes.length > 1 && <ShapeLegend shapes={uniqueShapes} />}
</div>
```

---

## Common Tasks & Solutions

### Task: Load Data from CSV/JSON

```typescript
// utils/dataLoader.ts
import Papa from 'papaparse';

export async function loadCSV(url: string): Promise<AstronomicalObject[]> {
  const response = await fetch(url);
  const text = await response.text();
  
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      complete: (results) => resolve(results.data as AstronomicalObject[]),
      error: (error) => reject(error)
    });
  });
}

export async function loadJSON(url: string): Promise<VisualizationData> {
  const response = await fetch(url);
  return response.json();
}
```

### Task: Generate Color Scale

```typescript
// utils/colorMapper.ts
import { scaleLinear, scaleLog, scaleQuantile } from 'd3-scale';

export function createColorScale(
  data: AstronomicalObject[],
  mapping: ColorMapping
) {
  const values = data.map(d => d[mapping.column!]).filter(v => v != null);
  
  const scale = mapping.scale === 'log' 
    ? scaleLog()
    : mapping.scale === 'quantile'
    ? scaleQuantile()
    : scaleLinear();
    
  return scale
    .domain(mapping.domain || [Math.min(...values), Math.max(...values)])
    .range(['#440154', '#fde724']); // viridis colors
}
```

### Task: Validate Shapes

```typescript
// utils/shapeRenderer.ts
const VALID_SHAPES = [
  'star', 'triangle', 'square', 'pentagon', 
  'hexagon', 'polygon', 'diamond', 'circle', 'rectangle'
] as const;

export function validateShape(shape: string | undefined): EmbeddingShape {
  if (!shape || !VALID_SHAPES.includes(shape as EmbeddingShape)) {
    return 'rectangle';
  }
  return shape as EmbeddingShape;
}
```

### Task: Handle Mobile Gestures

```typescript
// Configure deck.gl controller
const viewState = {
  longitude: 0,
  latitude: 0,
  zoom: 10,
  minZoom: 5,
  maxZoom: 20
};

<DeckGL
  viewState={viewState}
  controller={{
    dragPan: true,
    dragRotate: false,
    scrollZoom: true,
    touchZoom: true,
    touchRotate: false,
    keyboard: false
  }}
  // ... layers
/>
```

---

## Performance Considerations

### Critical Performance Rules

1. **Pre-generate shape textures**: Create IconLayer atlas once at startup
2. **Debounce hover events**: 150ms delay to prevent excessive image loads
3. **Memoize components**: Use `React.memo` for ImageTooltip, DetailPanel
4. **Cache images**: Store loaded images in Map or WeakMap
5. **Lazy load images**: Only load when hovering/clicking
6. **Use CSS transforms**: Hardware-accelerated for animations
7. **Optimize re-renders**: Use `useMemo` and `useCallback` appropriately

### Performance Anti-Patterns to Avoid

❌ **DON'T:**
- Recreate deck.gl layers on every render
- Load all images upfront
- Use inline functions in JSX (causes re-renders)
- Apply complex calculations in render
- Ignore viewport culling

✅ **DO:**
- Memoize layer configurations
- Load images on-demand
- Define callbacks outside render or use useCallback
- Move calculations to useMemo
- Let deck.gl handle viewport culling

---

## Testing Guidelines

### What to Test

**Unit Tests:**
- Data loading (CSV/JSON parsing)
- Color scale generation
- Shape validation
- Utility functions

**Integration Tests:**
- Component rendering with data
- User interactions (hover, click)
- Mobile gesture handling
- Legend visibility toggle

**Performance Tests:**
- Render 10k, 50k points
- Measure frame rate during pan/zoom
- Test image loading under slow network
- Mobile device testing

### Testing Tools
- **Vitest** - Unit testing
- **React Testing Library** - Component testing
- **Chrome DevTools** - Performance profiling
- **BrowserStack** - Cross-browser testing

---

## Common Pitfalls & Solutions

### Pitfall 1: deck.gl Not Rendering
**Cause:** Missing or incorrect viewState
**Solution:** Ensure viewState has all required properties (longitude, latitude, zoom)

### Pitfall 2: Shapes Not Displaying
**Cause:** IconLayer requires iconAtlas and iconMapping
**Solution:** Pre-generate texture atlas with all shapes

### Pitfall 3: Images Not Loading
**Cause:** CORS restrictions
**Solution:** Add `crossOrigin="anonymous"` to img tags, ensure server sends CORS headers

### Pitfall 4: Poor Mobile Performance
**Cause:** Too many DOM elements or inefficient rendering
**Solution:** Use deck.gl (WebGL), minimize DOM elements, debounce events

### Pitfall 5: Legend Obscures Data
**Cause:** Opaque background or wrong positioning
**Solution:** Use semi-transparent background (bg-white/90), position in corner

---

## Code Style & Conventions

### Naming Conventions
- **Components:** PascalCase (e.g., `EmbeddingViewer.tsx`)
- **Hooks:** camelCase with "use" prefix (e.g., `useDataLoader.ts`)
- **Utils:** camelCase (e.g., `colorMapper.ts`)
- **Types:** PascalCase (e.g., `AstronomicalObject`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `DEFAULT_COLOR`)

### File Organization
- One component per file
- Co-locate related types in same file
- Export from index.ts for cleaner imports
- Keep files under 300 lines

### Import Order
```typescript
// 1. External dependencies
import React from 'react';
import { IconLayer } from '@deck.gl/layers';

// 2. Internal components
import { ImageTooltip } from '@/components/ImageTooltip';

// 3. Hooks and utilities
import { useDataLoader } from '@/hooks/useDataLoader';
import { validateShape } from '@/utils/shapeRenderer';

// 4. Types
import type { AstronomicalObject } from '@/utils/types';

// 5. Styles (if any separate CSS)
import './styles.css';
```

### TypeScript Best Practices
```typescript
// ✅ Good: Explicit return types
export function loadData(url: string): Promise<AstronomicalObject[]> {
  // ...
}

// ❌ Bad: Implicit any
export function loadData(url) {
  // ...
}

// ✅ Good: Type guard
function isValidShape(shape: string): shape is EmbeddingShape {
  return VALID_SHAPES.includes(shape as EmbeddingShape);
}

// ✅ Good: Readonly arrays for constants
const VALID_SHAPES = [
  'star', 'circle', 'hexagon'
] as const;
```

---

## Debugging Tips

### Enable deck.gl Debug Mode
```typescript
<DeckGL
  debug={true}  // Shows FPS, picking info
  // ...
/>
```

### Log Performance Metrics
```typescript
const start = performance.now();
// ... operation
console.log(`Operation took ${performance.now() - start}ms`);
```

### Inspect State with React DevTools
- Install React DevTools browser extension
- Use Components tab to inspect props/state
- Use Profiler tab to identify slow renders

### Test Mobile Gestures in Desktop
- Chrome DevTools → Toggle device toolbar (Cmd+Shift+M)
- Select mobile device preset
- Enable touch simulation

---

## Dependencies Reference

### Core Dependencies
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "deck.gl": "^9.0.0",
  "@deck.gl/core": "^9.0.0",
  "@deck.gl/layers": "^9.0.0",
  "@deck.gl/react": "^9.0.0",
  "d3-scale": "^4.0.2",
  "d3-color": "^3.1.0",
  "papaparse": "^5.4.1",
  "zustand": "^4.5.0"
}
```

### Development Dependencies
```json
{
  "typescript": "~5.7.2",
  "vite": "^6.2.0",
  "@vitejs/plugin-react": "^4.3.4",
  "tailwindcss": "~3",
  "autoprefixer": "~10",
  "postcss": "~8",
  "eslint": "^9.21.0",
  "prettier": "^3.5.3"
}
```

---

## Quick Start for Agents

### When Starting a New Feature:
1. Read relevant section in `implementation_plan.md`
2. Check `utils/types.ts` for data structures
3. Review existing similar components
4. Implement with TypeScript + Tailwind
5. Run `npm run lint` to verify no lint issues
6. Run `npm run typecheck` to verify no TypeScript type errors
7. Fix any lint or type errors before proceeding
8. Test on desktop and mobile
9. Update this AGENTS.md if needed

### When Debugging:
1. Check browser console for errors
2. Verify data structure matches types
3. Test with sample data
4. Check deck.gl layer configuration
5. Profile performance if slow

### When in Doubt:
- Refer to `implementation_plan.md` for architecture
- Check `UPDATES_SUMMARY.md` for feature list
- Review `SHAPE_FEATURE_SUMMARY.md` for shape details
- Follow existing code patterns

---

## Additional Resources

### Documentation Links
- [deck.gl Documentation](https://deck.gl/docs)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [D3 Scale Documentation](https://github.com/d3/d3-scale)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

### Example Repositories
- [deck.gl Examples](https://deck.gl/examples)
- [React + TypeScript + Vite Template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts)

---

## Questions & Issues

### For AI Agents:
If you encounter an ambiguous requirement:
1. Check implementation_plan.md for clarification
2. Follow existing code patterns
3. Make reasonable assumptions documented in comments
4. Prioritize type safety and performance

### For Developers:
If you find this guide incomplete:
1. Add missing sections
2. Document new patterns
3. Update examples
4. Keep it concise and actionable

---

**Version:** 1.0  
**Last Updated:** 2026-06-12  
**Maintained By:** Project team

---

## Summary Checklist for Agents

Before submitting code, verify:
- [ ] TypeScript with no `any` types (except flexible properties)
- [ ] Tailwind CSS for all styling
- [ ] Responsive design (mobile tested)
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Performance optimized (memoization, debouncing)
- [ ] Accessibility (ARIA labels, keyboard nav)
- [ ] Follows project structure
- [ ] Follows naming conventions
- [ ] Types imported from utils/types.ts
- [ ] `npm run lint` passes with no new issues
- [ ] `npm run typecheck` passes with no new errors

**Ready to build! 🚀**
