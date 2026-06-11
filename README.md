# Interactive Embedding Visualization

Web app for exploring 2D astronomical embeddings with high-performance rendering using deck.gl.

## Run

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Data Upload

- Upload dataset files from the toolbar with Upload (supports .json and .csv).
- Data points use embedding_x and embedding_y coordinates.
- Coordinate display is Cartesian: origin at bottom-left, x increases left-to-right, y increases bottom-to-top.

## Visualization Config Upload

Use **Upload config** in the toolbar to apply optional visualization overrides from a JSON file.

The config file supports three sections: `shapeLabels`, `shapeMapping`, and `colorMapping`.

---

### `shapeLabels` — Legend display labels for shapes

Map shape names to human-readable labels shown in the legend.

```json
{
  "shapeLabels": {
    "star": "Positive Class",
    "circle": "Negative Class"
  }
}
```

Valid shapes: `star`, `triangle`, `square`, `pentagon`, `hexagon`, `polygon`, `diamond`, `circle`, `rectangle`.

Shapes are determined by the `embedding_shape` column in the data when no `shapeMapping` is configured.

---

### `shapeMapping` — Derive shapes from a column value

Assign shapes dynamically based on values in a dataset column. Use `defaultShape` as a sibling field (not inside `categories`) to provide a fallback shape.

```json
{
  "shapeMapping": {
    "column": "predicted_class_display",
    "categories": {
      "class_0: Disturbed Galaxies": "star"
    },
    "defaultShape": "circle"
  }
}
```

- `column` — the dataset column whose values determine shapes.
- `categories` — maps column values to shapes.
- `defaultShape` — fallback shape for all unmatched values. Set alongside `categories`, not inside it.
- When a `shapeMapping` is present, it overrides the `embedding_shape` column.

---

### `colorMapping` — Color points by column value

Two modes: **continuous** and **categorical**.

#### Continuous mapping

```json
{
  "colorMapping": {
    "type": "continuous",
    "column": "magnitude",
    "scale": "linear",
    "min": 17,
    "max": 23,
    "colorScheme": "viridis"
  }
}
```

- `scale`: `linear`, `log`, or `quantile`.
- `colorScheme`: `viridis`, `plasma`, `turbo`, or `blues`.
- `min` / `max`: optional explicit domain (defaults to data range).

#### Categorical mapping

Maps specific column values to specific colors. Use `defaultColor` as a sibling field (not inside `categories`) to provide a fallback color.

```json
{
  "colorMapping": {
    "type": "categorical",
    "column": "predicted_class_display",
    "categories": {
      "class_0: Disturbed Galaxies": "#0f4c5c"
    },
    "defaultColor": "#f4f4f9"
  }
}
```

Categories also support a color-to-label format:

```json
{
  "colorMapping": {
    "type": "categorical",
    "column": "class",
    "categories": {
      "#f97316": "Spiral",
      "#0ea5e9": "Elliptical"
    }
  }
}
```

- `defaultColor` provides a fallback color for unmatched column values. It is not shown in the legend.
- The `"Use color column"` checkbox in the Display settings toggles whether the dataset's `color` column takes priority over the config's `colorMapping`.

---

### Color priority

When the "Use color column" checkbox is unchecked (default when a config provides a complete mapping):

1. Dataset `color` column — **ignored**
2. Config `colorMapping` with explicit value match — **applied**
3. Config `colorMapping` with `defaultColor` — **applied as fallback**
4. Hardcoded default color (`#4299e1`) — **last resort**

When the "Use color column" checkbox is checked:

1. Dataset `color` column — **applied first**
2. Config `colorMapping` — **fallback**

---

### Full example (using default values)

```json
{
  "shapeLabels": {
    "star": "class_0: Disturbed Galaxies",
    "circle": "Other"
  },
  "colorMapping": {
    "type": "categorical",
    "column": "predicted_class_display",
    "categories": {
      "class_0: Disturbed Galaxies": "#0f4c5c"
    },
    "defaultColor": "#f4f4f9"
  }
}
```

A sample file is available at `public/visualization-config.example.json`.

## Point Size Control

The toolbar includes a Point size slider.

- Default point size is 18.
- You can drag the slider to increase or decrease marker size.
- Use Default 18 in the toolbar to instantly reset to the default size.
