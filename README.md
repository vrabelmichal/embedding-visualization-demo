# Interactive 2D UMAP Embedding Visualization

High-performance web-based visualization for exploring 2D embeddings of astronomical objects (low surface brightness galaxies).

## 🚀 Quick Start

This project is currently in the **planning phase**. All documentation and implementation plans are ready for development.

### For Developers
1. Read [`implementation_plan.md`](./implementation_plan.md) for complete technical specifications
2. Review [`AGENTS.md`](./AGENTS.md) for coding guidelines and patterns
3. Check [`UPDATES_SUMMARY.md`](./UPDATES_SUMMARY.md) for feature overview

### For AI Agents
Start with [`AGENTS.md`](./AGENTS.md) - it contains all the context you need to contribute effectively.

---

## 📚 Documentation Structure

| Document | Purpose | Audience |
|----------|---------|----------|
| **[implementation_plan.md](./implementation_plan.md)** | Complete technical implementation plan with 6 phases, architecture, data schemas, and acceptance criteria | Developers, Project Managers |
| **[AGENTS.md](./AGENTS.md)** | AI agent guidelines with code patterns, common tasks, debugging tips, and best practices | AI Coding Agents, Developers |
| **[UPDATES_SUMMARY.md](./UPDATES_SUMMARY.md)** | Quick reference for all features and updates | Everyone |
| **[SHAPE_FEATURE_SUMMARY.md](./SHAPE_FEATURE_SUMMARY.md)** | Deep dive into shape feature implementation | Developers implementing shapes |

---

## ✨ Key Features

- 🎯 **High Performance**: 60fps rendering with 50k+ points using deck.gl WebGL
- 🎨 **Custom Shapes**: 9 marker shapes (star, circle, hexagon, triangle, etc.)
- 🖼️ **Shape-Clipped Images**: Hover tooltips with images clipped to match marker shape
- 📊 **Interactive Legend**: Fixed-position legend with color scale and shape reference
- 📱 **Mobile-First**: Touch gestures (pan, pinch-to-zoom) work seamlessly
- 🎨 **Flexible Coloring**: Explicit colors or column-based color mapping
- 📈 **Property Details**: Click to view all object properties in a table

---

## 🏗️ Technology Stack

- **Framework**: React 18 + TypeScript 5.7
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 3
- **Visualization**: deck.gl 9 (WebGL)
- **Data Processing**: D3-scale, PapaParse
- **State**: Zustand

---

## 📊 Data Format

### Input Data (CSV or JSON)

**Required Fields:**
- `coadd_object_id` - Unique identifier
- `embedding_x` - X coordinate in UMAP space
- `embedding_y` - Y coordinate in UMAP space  
- `image_url` - URL to object cutout image

**Optional Fields:**
- `color` - Hex color code (e.g., "#FF5733")
- `embedding_shape` - Shape name (star, circle, hexagon, etc.)
- Any additional properties (magnitude, redshift, etc.)

### Example CSV
```csv
coadd_object_id,embedding_x,embedding_y,image_url,color,embedding_shape,magnitude
LSB_001,-2.45,1.33,https://example.com/img1.jpg,#FF5733,star,18.5
LSB_002,3.21,-0.89,https://example.com/img2.jpg,,circle,19.2
LSB_003,0.15,2.67,https://example.com/img3.jpg,#3388FF,hexagon,20.1
```

### Example JSON
```json
{
  "objects": [
    {
      "coadd_object_id": "LSB_001",
      "embedding_x": -2.45,
      "embedding_y": 1.33,
      "image_url": "https://example.com/img1.jpg",
      "embedding_shape": "star",
      "color": "#FF5733",
      "magnitude": 18.5
    }
  ],
  "colorMapping": {
    "column": "magnitude",
    "scale": "linear",
    "colorScheme": "viridis",
    "domain": [17.0, 22.0]
  }
}
```

---

## 🎯 Implementation Status

### Phase 1: Project Setup (30 min) - ⬜ Not Started
- Initialize Vite + React + TypeScript
- Configure Tailwind CSS
- Install dependencies
- Set up project structure

### Phase 2: Data Layer (1.25 hr) - ⬜ Not Started
- TypeScript interfaces
- CSV/JSON loaders
- Color mapping utilities
- Shape validation

### Phase 3: Core Visualization (2.5 hr) - ⬜ Not Started
- deck.gl IconLayer setup
- Shape rendering
- Color rendering
- Pan/zoom controls

### Phase 4: Interactive Features (2.5 hr) - ⬜ Not Started
- Image tooltip with shape clipping
- Property details panel
- Click/hover handlers
- Mobile gestures

### Phase 5: UI Polish & Legend (1.5 hr) - ⬜ Not Started
- Control panel
- Fixed-position legend
- Color scale display
- Shape reference
- Responsive design

### Phase 6: Optimization & Testing (1 hr) - ⬜ Not Started
- Performance profiling
- Cross-browser testing
- Edge case handling
- Documentation

**Total Estimated Time:** 9.5 hours

---

## 🎨 Supported Shapes

1. **star** ★ - Five-pointed star
2. **triangle** ▲ - Equilateral triangle
3. **square** ■ - Square
4. **pentagon** ⬟ - Regular pentagon
5. **hexagon** ⬢ - Regular hexagon
6. **polygon** - Generic polygon (6+ sides)
7. **diamond** ◆ - 45° rotated square
8. **circle** ● - Circle
9. **rectangle** ▬ - Rectangle (default)

---

## 🎨 Color Schemes

Supports all D3 color scales:
- **Sequential**: viridis, plasma, turbo, blues, greens, reds
- **Diverging**: RdBu, PiYG, BrBG
- **Categorical**: category10, category20

---

## 🌐 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Safari (iOS 14+)
- ✅ Chrome Android

---

## 📱 Mobile Features

- Single-finger drag to pan
- Pinch gesture to zoom
- Tap to show image and details
- Responsive legend positioning
- Touch-optimized controls

---

## 🚧 Development

```bash
# Install dependencies (when implementation starts)
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

---

## 📖 For AI Agents

**Start here:** [`AGENTS.md`](./AGENTS.md)

This file contains:
- Project structure and architecture
- Code patterns and conventions
- Common tasks with solutions
- Performance guidelines
- Debugging tips
- TypeScript best practices
- Component examples

---

## 🤝 Contributing

This project follows these principles:
- **Type Safety**: 100% TypeScript, no `any` types
- **Performance**: 60fps target, WebGL rendering
- **Accessibility**: WCAG 2.1 Level AA
- **Mobile-First**: Responsive design from the start
- **Clean Code**: ESLint + Prettier enforced

---

## �� License

[License information to be added]

---

## 👥 Authors

[Author information to be added]

---

## 🔗 Related Projects

- [deck.gl](https://deck.gl/) - WebGL-powered visualization framework
- [UMAP](https://umap-learn.readthedocs.io/) - Dimensionality reduction algorithm
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

---

**Status:** 📋 Planning Complete - Ready for Implementation

**Last Updated:** 2026-01-13
