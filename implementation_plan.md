# Interactive 2D UMAP Embedding Visualization - Implementation Plan

## 📋 Project Overview
High-performance TypeScript web application for visualizing astronomical objects (low surface brightness galaxies) in 2D UMAP embedding space with interactive features including image previews and detailed property inspection.

### Target Use Case
- **Data**: Pre-computed 2D UMAP embeddings of astronomical objects
- **Users**: Astronomers exploring low surface brightness galaxy datasets
- **Goal**: Interactive exploration with hover images and click-through details
- **Platform**: Web (desktop + mobile), standalone with potential integration

## 🎯 Core Requirements

### 1. Data Input & Format
**Supported Formats:**
- CSV files with headers
- JSON files with structured data

**Required Data Fields:**
- `coadd_object_id` (string): Unique identifier for each astronomical object
- `embedding_x` (number): X-coordinate in 2D UMAP space
- `embedding_y` (number): Y-coordinate in 2D UMAP space
- `image_url` (string): URL to cutout image of the astronomical object
- `color` (string, optional): Hex color code for the point
- `embedding_shape` (string, optional): Shape of the marker and image clipping
- Additional properties: Any number of astronomical measurements/properties

**Supported Shapes (via `embedding_shape`):**
- `star` - Five-pointed star marker
- `triangle` - Equilateral triangle
- `square` - Square marker
- `pentagon` - Regular pentagon
- `hexagon` - Regular hexagon
- `polygon` - Generic polygon (6+ sides)
- `diamond` - 45° rotated square (rhombus)
- `circle` - Circular marker
- `rectangle` - Rectangle marker (default fallback)

If `embedding_shape` is not provided or invalid, defaults to `rectangle`. The marker shape in the scatter plot matches the specified shape, and hover images are clipped to the same shape.

**Color Mapping Configuration:**
- Separate section in JSON or separate file
- Specifies which column to use for coloring if `color` field is empty
- Defines color scale/range mapping for visualized values
- Falls back to column-based coloring when explicit colors not provided

### 2. Visualization Features
**Desktop Interactions:**
- **Hover**: Display cutout image of the astronomical object as tooltip
- **Click**: Show full property table (property name | value)
- **Mouse wheel**: Zoom in/out
- **Click + Drag**: Pan the view
- **High performance**: Smooth 60fps rendering

**Mobile Interactions:**
- **Single finger drag**: Pan the visualization
- **Pinch gesture**: Zoom in/out
- **Tap**: Show both image and property details
- **Responsive**: Works on phones and tablets

### 3. Data Display Components
**Image Tooltip (Hover/Tap):**
- Displays astronomical object cutout image
- Appears on hover (desktop) or tap (mobile)
- Responsive positioning to stay on screen
- **Image is clipped to match the object's `embedding_shape`** (e.g., star, circle, hexagon)
- Falls back to rectangle clipping if shape not specified

**Property Details Panel (Click/Tap):**
- Two-column table layout:
  - Left column: Property name
  - Right column: Property value
- Shows all available properties for the selected object
- Includes `coadd_object_id` and all custom fields

**Legend & Color Scale (Fixed Position):**
- Fixed position box (e.g., top-right corner of screen)
- Shows color scale when using column-based coloring
- Displays:
  - Color gradient/scale visualization
  - Min/max values or category labels
  - Which property is being visualized (e.g., "Magnitude")
  - Optional: Shape legend showing all used shapes
- Toggleable visibility (show/hide button)
- Draggable to different screen positions (optional)
- Responsive: adjusts position on mobile
- Semi-transparent background to not obscure data
- Hidden when using explicit colors (unless shapes are varied)

## 🏗️ Technology Stack

### Core Framework
- **Vite** - Build tool and dev server (already in parent app)
- **TypeScript** (~5.7.2) - Type-safe development
- **React** (^19.0.10) - UI framework
- **Tailwind CSS** (~3) - Styling framework

### Visualization Libraries
- **deck.gl** (^9.0.0) - High-performance WebGL-based visualization
  - Handles 100k+ points at 60fps
  - Built-in pan/zoom/gesture support
  - Excellent mobile touch support
  - **IconLayer** for custom shape rendering (star, triangle, hexagon, etc.)
- **@deck.gl/react** - React integration
- **@deck.gl/layers** - IconLayer and other layer types for shape support

### Data & Color Handling
- **papaparse** (^5.4.1) - Robust CSV parsing
- **d3-scale** (^4.0.2) - Color scale mapping (linear, log, quantile)
- **d3-color** (^3.1.0) - Color manipulation utilities

### State Management
- **zustand** (^4.5.0) - Lightweight state management
  - Simpler than Redux for this use case
  - Better TypeScript support
  - Minimal boilerplate

### Existing Dependencies (from parent app)
- autoprefixer (~10)
- postcss (~8)
- @types/react (^19.0.10)
- @types/react-dom (^19.0.4)
- @vitejs/plugin-react (^4.3.4)
- eslint, prettier, typescript-eslint (for code quality)

### Performance Strategy
- **WebGL rendering**: deck.gl provides hardware-accelerated rendering
- **Shape rendering**: Pre-generate shape textures/sprites once, reuse for all instances
- **Lazy image loading**: Only load images when hovering/clicking
- **Debouncing**: 150ms delay on hover to prevent excessive image loading
- **Memoization**: React.memo for heavy components
- **Virtual viewport**: Only render points in visible area
- **Image caching**: Cache loaded images in memory
- **CSS clip-path**: Hardware-accelerated shape clipping for image tooltips

## 📊 Data Schema & TypeScript Interfaces

### Primary Data Structure (JSON)
```typescript
// Supported marker and image clipping shapes
type EmbeddingShape = 
  | 'star'      // Five-pointed star
  | 'triangle'  // Equilateral triangle
  | 'square'    // Square
  | 'pentagon'  // Regular pentagon
  | 'hexagon'   // Regular hexagon
  | 'polygon'   // Generic polygon (6+ sides)
  | 'diamond'   // 45° rotated square (rhombus)
  | 'circle'    // Circle
  | 'rectangle';// Rectangle (default)

interface AstronomicalObject {
  coadd_object_id: string;           // Unique object identifier
  embedding_x: number;                // X-coordinate in UMAP space
  embedding_y: number;                // Y-coordinate in UMAP space
  image_url: string;                  // URL to cutout image
  color?: string;                     // Optional hex color (e.g., "#FF5733")
  embedding_shape?: EmbeddingShape;   // Optional marker shape (default: 'rectangle')
  
  // Additional astronomical properties (examples)
  magnitude?: number;
  redshift?: number;
  surface_brightness?: number;
  radius?: number;
  [key: string]: any;                 // Any additional properties
}

interface ColorMapping {
  column?: string;                    // Column name to use for coloring
  scale: 'linear' | 'log' | 'quantile' | 'categorical';
  colorScheme: string;                // e.g., 'viridis', 'plasma', 'turbo'
  domain?: [number, number];          // [min, max] for continuous scales
  categories?: string[];              // For categorical scales
}

interface VisualizationData {
  objects: AstronomicalObject[];
  colorMapping?: ColorMapping;
  metadata?: {
    title?: string;
    description?: string;
    totalObjects?: number;
  };
}
```

### CSV Format Alternative
**Main data file: `galaxies.csv`**
```csv
coadd_object_id,embedding_x,embedding_y,image_url,color,embedding_shape,magnitude,redshift
LSB_001,-2.45,1.33,https://example.com/img1.jpg,#FF5733,star,18.5,0.045
LSB_002,3.21,-0.89,https://example.com/img2.jpg,,circle,19.2,0.052
LSB_003,0.15,2.67,https://example.com/img3.jpg,#3388FF,hexagon,20.1,0.038
LSB_004,1.88,-1.24,https://example.com/img4.jpg,,,18.9,0.041
```
Note: When `embedding_shape` is empty, defaults to `rectangle`.

**Color config file: `color-config.json`**
```json
{
  "column": "magnitude",
  "scale": "linear",
  "colorScheme": "viridis",
  "domain": [17.0, 22.0]
}
```

### Color Priority Logic
```
1. If object.color exists → use it directly
2. Else if colorMapping.column specified → compute color from column value
3. Else → use default color (#4299e1)
```

### Shape Priority Logic
```
1. If object.embedding_shape exists and is valid → use specified shape
2. Else → use default shape (rectangle)

Valid shapes: star, triangle, square, pentagon, hexagon, polygon, diamond, circle, rectangle
```

## 📁 Project Structure
```
interactive-embedding-visualization/
├── src/
│   ├── components/
│   │   ├── EmbeddingViewer.tsx       # Main container component
│   │   ├── ScatterPlot.tsx           # deck.gl scatter plot layer
│   │   ├── ImageTooltip.tsx          # Hover image preview tooltip (shape-clipped)
│   │   ├── DetailPanel.tsx           # Click details modal/panel
│   │   ├── Controls.tsx              # Zoom/reset/pan controls
│   │   ├── Legend.tsx                # Fixed-position legend box with color scale & shapes
│   │   ├── ColorScale.tsx            # Color gradient/scale visualization component
│   │   ├── ShapeLegend.tsx           # Shape reference display (optional)
│   │   └── LoadingState.tsx          # Loading indicators
│   │
│   ├── hooks/
│   │   ├── useDataLoader.ts          # Data loading from CSV/JSON
│   │   ├── useViewState.ts           # Pan/zoom state management
│   │   ├── useColorMapping.ts        # Color calculation logic
│   │   ├── useShapeMapping.ts        # Shape validation and rendering
│   │   └── useImagePreload.ts        # Image lazy loading
│   │
│   ├── utils/
│   │   ├── dataLoader.ts             # CSV/JSON parsing utilities
│   │   ├── colorMapper.ts            # Color scale generation
│   │   ├── shapeRenderer.ts          # Shape path generation (SVG/Canvas)
│   │   ├── gestureHandlers.ts        # Mobile gesture detection
│   │   └── types.ts                  # TypeScript interfaces
│   │
│   ├── store/
│   │   └── visualizationStore.ts     # Zustand state management
│   │
│   ├── App.tsx                       # Root component
│   ├── main.tsx                      # Entry point
│   └── index.css                     # Global styles + Tailwind
│
├── public/
│   ├── sample-data.json              # Sample astronomical data
│   └── sample-images/                # Sample cutout images
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── .eslintrc.json
└── README.md
```

## 🔧 Implementation Phases

**Total Estimated Time: ~9.5 hours**

### Phase 1: Project Setup (30 minutes)
**Goal:** Establish development environment
1. Initialize Vite + React + TypeScript project
2. Configure Tailwind CSS with PostCSS
3. Install core dependencies (deck.gl, d3-scale, papaparse, zustand)
4. Set up ESLint and Prettier
5. Create basic project structure (folders, empty components)

**Deliverable:** Running dev server with "Hello World"

---

### Phase 2: Data Layer (1.25 hours)
**Goal:** Load and process astronomical data
1. **Create TypeScript interfaces** (`utils/types.ts`)
   - AstronomicalObject, EmbeddingShape type, ColorMapping, VisualizationData
2. **Implement data loaders** (`utils/dataLoader.ts`)
   - CSV parser using papaparse
   - JSON loader with validation
   - Shape validation (fallback to 'rectangle')
   - Error handling for malformed data
3. **Create color mapping utility** (`utils/colorMapper.ts`)
   - d3-scale integration
   - Support linear, log, quantile scales
   - Handle missing/null values
4. **Create shape utility** (`utils/shapeRenderer.ts`)
   - SVG path generation for each shape type
   - Shape validation function
   - Canvas clip path generation for image clipping
5. **Build data loading hook** (`hooks/useDataLoader.ts`)
   - Async data fetching
   - Loading/error states
   - Data validation
6. **Create sample data file** (`public/sample-data.json`)
   - 100-500 sample objects with realistic values
   - Mix of objects with/without explicit colors
   - Mix of different shapes (star, circle, hexagon, etc.)

**Deliverable:** Data successfully loads with shapes validated and displays in console

---

### Phase 3: Core Visualization (2.5 hours)
**Goal:** Render interactive scatter plot with custom shapes
1. **Set up deck.gl foundation** (`components/ScatterPlot.tsx`)
   - Initialize DeckGL component
   - Use IconLayer or custom layer for shape support
   - Map data to layer properties
   - Generate shape textures/sprites for each shape type
2. **Implement shape rendering**
   - Create SVG icons for each shape (star, triangle, square, etc.)
   - Convert SVG to canvas textures for deck.gl IconLayer
   - Map embedding_shape to appropriate icon
   - Handle shape fallback (default to rectangle)
3. **Implement color rendering**
   - Use explicit colors when available
   - Fall back to column-based coloring
   - Apply d3 color scales
   - Combine color with shape rendering
4. **Add view state management** (`hooks/useViewState.ts`)
   - Initial view calculation (fit all points)
   - Pan/zoom state tracking
   - View bounds constraints
5. **Integrate with main component** (`components/EmbeddingViewer.tsx`)
   - Layout structure with Tailwind
   - Connect data to ScatterPlot
   - Handle loading states
6. **Mobile gesture support**
   - Configure deck.gl for touch events
   - Pinch-to-zoom
   - Single-finger pan
   - Test on mobile viewport

**Deliverable:** Points render with correct shapes and colors, pan/zoom works on desktop and mobile

---

### Phase 4: Interactive Features (2.5 hours)
**Goal:** Add hover tooltips with shape-clipped images and click details
1. **Image tooltip component** (`components/ImageTooltip.tsx`)
   - Position near cursor/touch point
   - Load image on demand
   - **Apply CSS clip-path or SVG mask based on embedding_shape**
   - Implement shape clipping for all supported shapes:
     - Circle: `clip-path: circle(50%)`
     - Star: Custom SVG clip path with 5 points
     - Triangle: `clip-path: polygon(50% 0%, 0% 100%, 100% 100%)`
     - Square: Standard rectangle
     - Pentagon: Custom SVG polygon clip path
     - Hexagon: `clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)`
     - Diamond: `clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)`
     - Rectangle: Default, no clipping
   - Handle image loading errors
   - Responsive positioning (stay on screen)
   - Debounce hover events (150ms)
2. **Implement hover detection**
   - deck.gl `onHover` callback
   - Get object under cursor (including shape info)
   - Show/hide tooltip
   - Desktop-only hover behavior
3. **Detail panel component** (`components/DetailPanel.tsx`)
   - Modal/sidebar layout with Tailwind
   - Two-column property table
   - Include shape information in properties
   - Close button
   - Scrollable for many properties
   - Mobile-friendly layout
4. **Implement click/tap detection**
   - deck.gl `onClick` callback
   - Select object and show details
   - Show both shape-clipped image and details on mobile
   - Deselect when clicking empty space
5. **Image preloading** (`hooks/useImagePreload.ts`)
   - Cache loaded images
   - Preload images for visible points
   - Handle slow/failed loads gracefully

**Deliverable:** Full interaction cycle works: hover → shape-clipped image, click → details

---

### Phase 5: UI Polish & Legend (1.5 hours)
**Goal:** Professional user interface with informative legend
1. **Control panel** (`components/Controls.tsx`)
   - Zoom in/out buttons
   - Reset view button
   - Toggle legend visibility button
   - Fullscreen toggle (optional)
   - Tailwind styling
2. **Legend component** (`components/Legend.tsx`)
   - **Fixed position box (default: top-right corner)**
   - Semi-transparent background (bg-white/90 or bg-gray-900/80)
   - Rounded corners with shadow for depth
   - Compact, non-intrusive design
   - Toggle show/hide functionality
   - Responsive positioning (adjusts on mobile)
3. **Color scale visualization** (`components/ColorScale.tsx`)
   - Gradient bar showing color scale (when using column-based coloring)
   - Display min/max values or category labels
   - Show which property is being visualized (e.g., "Magnitude: 17.0 - 22.0")
   - Support for different scale types (linear, log, quantile)
   - Hide when all objects use explicit colors
4. **Shape legend** (`components/ShapeLegend.tsx`)
   - Show all shapes used in current dataset
   - Small icon + label for each shape
   - Only display shapes actually present in data
   - Compact grid layout
   - Can be toggled independently or shown with color scale
5. **Loading states** (`components/LoadingState.tsx`)
   - Initial data loading spinner
   - Skeleton UI while parsing data
   - Progress indicator for large files
6. **Error handling**
   - User-friendly error messages
   - Network error handling
   - Malformed data warnings
7. **Responsive design**
   - Mobile layout adjustments for legend
   - Touch-friendly button sizes
   - Proper spacing with Tailwind
8. **Accessibility**
   - Keyboard navigation support
   - ARIA labels
   - Focus indicators

**Deliverable:** Polished, production-ready interface with informative legend

---

### Phase 6: Optimization & Testing (1 hour)
**Goal:** Ensure high performance
1. **Performance profiling**
   - Test with 1k, 10k, 50k points
   - Monitor frame rate during pan/zoom
   - Check memory usage
2. **Implement optimizations**
   - React.memo for expensive components
   - Debounce/throttle event handlers
   - Optimize re-renders
   - Virtual scrolling for detail panel (if needed)
3. **Image optimization**
   - Implement image caching strategy
   - Cancel pending loads on rapid hover
   - Use thumbnail URLs if available
4. **Cross-browser testing**
   - Chrome, Firefox, Safari
   - Mobile Safari (iOS)
   - Chrome Android
5. **Edge case handling**
   - Empty dataset
   - Single point
   - Duplicate coordinates
   - Missing image URLs
   - Very large property lists
   - Legend overflow with many shapes/categories
   - Long property names in legend
6. **Documentation**
   - Update README with usage instructions
   - Document data format requirements
   - Add code comments where needed

**Deliverable:** Production-ready, well-tested application

---

## 📦 Complete Package.json Dependencies

```json
{
  "name": "interactive-embedding-visualization",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\""
  },
  "dependencies": {
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
  },
  "devDependencies": {
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "@types/papaparse": "^5.3.14",
    "@types/d3-scale": "^4.0.8",
    "@types/d3-color": "^3.1.3",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "~5.7.2",
    "vite": "^6.2.0",
    "autoprefixer": "~10",
    "postcss": "~8",
    "tailwindcss": "~3",
    "eslint": "^9.21.0",
    "typescript-eslint": "^8.24.1",
    "prettier": "^3.5.3"
  }
}
```
## 🎯 Performance Targets & Success Metrics

### Performance Benchmarks
- **Initial load**: < 2 seconds for 10,000 points
- **Render performance**: 60fps during pan/zoom operations
- **Hover response**: < 200ms from hover to image display
- **Click response**: < 100ms to show detail panel
- **Mobile performance**: Smooth on iPhone 12+ / equivalent Android devices
- **Large datasets**: Handle up to 50,000 points without degradation

### Browser Compatibility
- ✅ Chrome 90+ (desktop & mobile)
- ✅ Firefox 88+ (desktop & mobile)
- ✅ Safari 14+ (desktop & mobile)
- ✅ Edge 90+

### Quality Metrics
- **TypeScript**: 100% type coverage, no `any` types in production code
- **Responsive**: Works on screens from 320px to 4K
- **Accessibility**: WCAG 2.1 Level AA compliance
- **Bundle size**: < 500KB gzipped
- **Error handling**: Graceful degradation for all error cases

---

## 🚀 Deployment & Integration

### Build Output
```bash
npm run build
# Generates static files in dist/:
# - index.html
# - assets/[hash].js
# - assets/[hash].css
```

### Integration Options

**Option 1: Standalone Deployment**
- Deploy `dist/` folder to any static host (Vercel, Netlify, GitHub Pages)
- Configure CORS if images hosted on different domain
- Environment variables for API endpoints (if needed)

**Option 2: Integration into Existing React App**
```tsx
import { EmbeddingViewer } from 'interactive-embedding-visualization';

function App() {
  return <EmbeddingViewer dataUrl="/api/galaxies.json" />;
}
```

**Option 3: iframe Embed**
```html
<iframe src="/embedding-viewer" width="100%" height="600px"></iframe>
```

### CORS Considerations
If astronomical object images are hosted on external domains:
```typescript
// Add crossOrigin attribute to images
<img src={object.image_url} crossOrigin="anonymous" />
```

Ensure image servers send proper CORS headers:
```
Access-Control-Allow-Origin: *
```

---

## 💡 Future Enhancement Ideas

### Phase 2 Features (Post-MVP)
1. **Search & Filter**
   - Search by object ID
   - Filter by property ranges
   - Multi-select mode

2. **Data Export**
   - Export selected points to CSV
   - Export current view as PNG/SVG
   - Copy object properties to clipboard

3. **Advanced Visualization**
   - Multiple color schemes (sequential, diverging, categorical)
   - Point size based on property value
   - Additional custom shapes beyond the core 9 shapes
   - Animated shape transitions
   - Density heatmap overlay
   - Contour lines for clusters

4. **Comparison Mode**
   - Side-by-side embeddings
   - Animation between different color mappings
   - Historical comparison (different UMAP runs)

5. **Annotation Tools**
   - Draw regions of interest
   - Add notes to specific objects
   - Share annotated views via URL

6. **3D Support**
   - 3D UMAP/t-SNE embeddings
   - WebGL 3D scatter plot
   - Interactive rotation

7. **Advanced Image Features**
   - Image gallery view
   - Zoom into images
   - Multi-band image display (RGB composites)
   - Image comparison slider

8. **Performance Enhancements**
   - WebGL 2.0 for even better performance
   - Progressive data loading (stream large datasets)
   - Server-side filtering/aggregation
   - Web Worker for heavy computations

9. **Collaboration**
   - Share specific views via URL parameters
   - Real-time collaborative exploration (WebSocket)
   - Comment system

10. **Integration Features**
    - API for programmatic access
    - Jupyter notebook widget
    - Python client library
    - REST API for data upload

---

## 📚 Technical References

### deck.gl Documentation
- [ScatterplotLayer](https://deck.gl/docs/api-reference/layers/scatterplot-layer)
- [InteractiveMap](https://deck.gl/docs/get-started/using-with-react)
- [Performance Optimization](https://deck.gl/docs/developer-guide/performance)

### D3 Color Scales
- [d3-scale](https://github.com/d3/d3-scale)
- [d3-scale-chromatic](https://github.com/d3/d3-scale-chromatic) (color schemes)

### Mobile Gestures
- [Hammer.js](https://hammerjs.github.io/) (if additional gestures needed)
- [deck.gl Touch Support](https://deck.gl/docs/developer-guide/interactivity)

### Astronomical Data
- Standard FITS cutout format
- VO Table format (if needed for advanced integration)
- HiPS for hierarchical progressive images

---

## 🎓 Development Best Practices

### Code Quality
- **Type Safety**: Use TypeScript interfaces for all data structures
- **Component Structure**: Keep components small and focused
- **Custom Hooks**: Extract complex logic into reusable hooks
- **Error Boundaries**: Wrap visualization in React error boundary
- **Testing**: Unit tests for utilities, integration tests for interactions

### Performance
- **Lazy Loading**: Only load what's needed
- **Memoization**: Use React.memo and useMemo strategically
- **Debouncing**: Prevent excessive re-renders
- **Code Splitting**: Split routes if expanding the app
- **Profiling**: Use React DevTools Profiler

### Accessibility
- **Keyboard Navigation**: Tab through interactive elements
- **Screen Readers**: Provide text alternatives for visual elements
- **Focus Management**: Clear focus indicators
- **Color Contrast**: Ensure sufficient contrast ratios
- **ARIA Labels**: Proper labeling for custom components

### Security
- **Input Validation**: Validate all data inputs
- **XSS Prevention**: Sanitize user inputs (if adding search/filter)
- **HTTPS**: Serve over HTTPS in production
- **CSP**: Content Security Policy headers
- **Dependency Auditing**: Regular `npm audit` checks

---

## 📖 README Structure (To be created)

```markdown
# Interactive 2D UMAP Embedding Visualization

High-performance web-based visualization for exploring 2D embeddings
of astronomical objects (low surface brightness galaxies).

## Features
- 🚀 60fps rendering with deck.gl WebGL
- 📱 Mobile-first design with touch gestures
- 🖼️ Hover image previews
- 📊 Click-through property details
- �� Flexible color mapping
- 📈 Handles 50k+ objects smoothly

## Quick Start
[Installation and usage instructions]

## Data Format
[JSON/CSV schema documentation]

## Development
[Setup, build, and contribution guidelines]

## License
[License information]
```

---

## ✅ Acceptance Criteria Checklist

Before considering the project complete, verify:

- [ ] Loads CSV and JSON data files
- [ ] Renders all objects as points on 2D scatter plot
- [ ] **Supports all 9 shape types (star, triangle, square, pentagon, hexagon, polygon, diamond, circle, rectangle)**
- [ ] **Markers render with correct shape based on `embedding_shape` field**
- [ ] **Defaults to rectangle shape when `embedding_shape` is missing or invalid**
- [ ] Uses explicit `color` field when available
- [ ] Falls back to column-based coloring via color mapping config
- [ ] **Hover shows cutout image clipped to the object's shape (desktop)**
- [ ] **Image clipping works correctly for all 9 shape types**
- [ ] Click shows property table (desktop)
- [ ] **Tap shows shape-clipped image + properties (mobile)**
- [ ] **Legend box displays in fixed position (e.g., top-right corner)**
- [ ] **Legend shows color scale when using column-based coloring**
- [ ] **Legend displays min/max values and property name**
- [ ] **Legend shows shape reference for all shapes used in dataset**
- [ ] **Legend can be toggled (show/hide)**
- [ ] **Legend has semi-transparent background and doesn't obscure data**
- [ ] **Legend is responsive and adjusts position on mobile**
- [ ] Single-finger drag pans (mobile)
- [ ] Pinch gesture zooms (mobile)
- [ ] Mouse wheel zooms (desktop)
- [ ] Click-drag pans (desktop)
- [ ] 60fps performance with 10k+ objects (with varying shapes)
- [ ] Works on Chrome, Firefox, Safari
- [ ] Works on iOS Safari and Chrome Android
- [ ] All TypeScript types properly defined (including EmbeddingShape type)
- [ ] Tailwind CSS properly configured
- [ ] Error handling for missing images
- [ ] Error handling for malformed data
- [ ] Error handling for invalid shape values
- [ ] Can be integrated into existing React app
- [ ] Documentation complete

---

**End of Implementation Plan**

Ready to proceed with implementation when you are! 🚀

---

## 🎨 Legend Design Specifications

### Visual Layout
```
┌─────────────────────────────┐
│ Legend              [✕] ⚙️  │  ← Header with close/settings
├─────────────────────────────┤
│ Magnitude                   │  ← Property name
│ ┌─────────────────────────┐ │
│ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ │  ← Color gradient
│ └─────────────────────────┘ │
│ 17.0              22.0      │  ← Min/Max labels
├─────────────────────────────┤
│ Shapes                      │  ← Shape section (if varied)
│ ★ Star    ● Circle          │
│ ▲ Triangle ◆ Diamond        │
│ ■ Square  ⬢ Hexagon         │
└─────────────────────────────┘
```

### Tailwind CSS Implementation Example
```tsx
<div className="fixed top-4 right-4 bg-white/90 dark:bg-gray-900/90 
                backdrop-blur-sm rounded-lg shadow-lg p-4 
                max-w-xs border border-gray-200 dark:border-gray-700
                transition-all duration-200">
  {/* Header */}
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
      Legend
    </h3>
    <button className="p-1 hover:bg-gray-100 rounded">
      <XIcon className="w-4 h-4" />
    </button>
  </div>
  
  {/* Color Scale Section */}
  {showColorScale && (
    <div className="mb-4">
      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
        {colorMapping.column}
      </p>
      <div className="h-4 rounded" 
           style={{ background: 'linear-gradient(to right, #440154, #fde724)' }} />
      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
        <span>{minValue}</span>
        <span>{maxValue}</span>
      </div>
    </div>
  )}
  
  {/* Shape Legend Section */}
  {uniqueShapes.length > 1 && (
    <div>
      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
        Shapes
      </p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {uniqueShapes.map(shape => (
          <div key={shape} className="flex items-center gap-1">
            <ShapeIcon shape={shape} className="w-3 h-3" />
            <span className="capitalize">{shape}</span>
          </div>
        ))}
      </div>
    </div>
  )}
</div>
```

### Position Options
- **Default**: `top-4 right-4` (top-right)
- **Alternatives**: 
  - Top-left: `top-4 left-4`
  - Bottom-right: `bottom-4 right-4`
  - Bottom-left: `bottom-4 left-4`

### Responsive Behavior
```css
/* Desktop: top-right */
@media (min-width: 768px) {
  .legend { top: 1rem; right: 1rem; }
}

/* Mobile: top-center or bottom-center */
@media (max-width: 767px) {
  .legend { 
    top: 1rem; 
    left: 50%; 
    transform: translateX(-50%);
    max-width: calc(100vw - 2rem);
  }
}
```

### Color Scale Gradients (d3-scale-chromatic)
```typescript
// Popular sequential color schemes
const colorSchemes = {
  viridis: ['#440154', '#31688e', '#35b779', '#fde724'],
  plasma: ['#0d0887', '#7e03a8', '#cc4778', '#f89540', '#f0f921'],
  turbo: ['#30123b', '#4777ef', '#1ac7c2', '#a0fc3c', '#faba39'],
  blues: ['#f7fbff', '#4292c6', '#08519c'],
  reds: ['#fff5f0', '#fb6a4a', '#67000d'],
  greens: ['#f7fcf5', '#74c476', '#00441b']
};
```

### State Management
```typescript
interface LegendState {
  visible: boolean;           // Show/hide legend
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showColorScale: boolean;    // Show color gradient
  showShapeLegend: boolean;   // Show shape reference
  collapsed: boolean;         // Minimize to icon only
}
```

