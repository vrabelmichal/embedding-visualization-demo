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

The config file supports three sections: `colorMapping`, `shapeLabels`, and `shapeMapping`.

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
- The `"Use color column"` checkbox in the Display settings toggles whether the dataset's CSV `color` column takes priority over the config's `colorMapping`.

#### Color priority (when "Use color column" is unchecked)

1. Config `colorMapping` with explicit value match — **applied**
2. Config `colorMapping` with `defaultColor` — **applied as fallback**
3. Hardcoded default color (`#4299e1`) — **last resort**

---

### Controlling which shapes points are drawn with

There are two approaches, depending on how your data is structured:

#### Approach A: Shapes are already in the data (`embedding_shape` column)

If your CSV or JSON data already has an `embedding_shape` column (one of the valid shape names per row), the shapes are drawn automatically. No `shapeMapping` is needed.

**`shapeLabels`** is optional in this case — it only controls what text the legend displays next to each shape icon:

```json
{
  "shapeLabels": {
    "star": "class_0: Disturbed Galaxies",
    "circle": "Other"
  }
}
```

> **What this does:** The data already tells each point "be a star" or "be a circle". This config only changes the legend text — `"star"` displays as "class_0: Disturbed Galaxies" and `"circle"` displays as "Other".

Valid shapes: `star`, `triangle`, `square`, `pentagon`, `hexagon`, `polygon`, `diamond`, `circle`, `rectangle`, `cross`, `x`, `plus`.

#### Approach B: No `embedding_shape` column — determine shapes from another column

If your data does **not** have an `embedding_shape` column, use `shapeMapping` to derive shapes from the values of any other column.

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

> **What this does:** For each point, read the `predicted_class_display` column. If the value is `"class_0: Disturbed Galaxies"`, draw that point as a star. For **any other value**, draw it as a circle (the fallback).

- `column` — the dataset column to read values from.
- `categories` — maps specific column values to shapes.
- `defaultShape` — fallback shape for all unmatched values. Set alongside `categories`, not inside it.
- When a `shapeMapping` is present, it overrides the `embedding_shape` column entirely.

---

### Putting it together: a typical per-class config

This is how per-class binary classification files are typically configured. The data already has `embedding_shape` column with `star` (positive class) and `circle` (negative class). The config provides:

- `shapeLabels` to give human-readable labels in the legend for each shape.
- `colorMapping` with `defaultColor` to color the positive class distinctly and show all other classes with a neutral fallback.

```json
{
  "shapeLabels": {
    "star": "class_0: Disturbed Galaxies",
    "circle": "Other"
  },
  "colorMapping": {
    "type": "categorical",
    "column": "target_class_display",
    "categories": {
      "class_0: Disturbed Galaxies": "#0f4c5c"
    },
    "defaultColor": "#f4f4f9"
  }
}
```

### Complete example (all features)

This example combines every feature: shape labels, shape derivation from a column, continuous color mapping, and a categorical color mapping with fallback. Only one `colorMapping` and one shape source (`shapeMapping` or `embedding_shape` + `shapeLabels`) are active at a time — but this shows the full schema.

```json
{
  "shapeLabels": {
    "star": "class_0: Disturbed Galaxies",
    "circle": "Other",
    "hexagon": "class_5: Barred Spiral Galaxies",
    "diamond": "class_7: Unbarred Loose Spiral Galaxies",
    "square": "class_8: Edge-on Galaxies"
  },
  "shapeMapping": {
    "column": "predicted_class_display",
    "categories": {
      "class_0: Disturbed Galaxies": "star",
      "class_5: Barred Spiral Galaxies": "hexagon",
      "class_7: Unbarred Loose Spiral Galaxies": "diamond",
      "class_8: Edge-on Galaxies without a Bulge": "square"
    },
    "defaultShape": "circle"
  },
  "colorMapping": {
    "type": "categorical",
    "column": "predicted_class_display",
    "categories": {
      "class_0: Disturbed Galaxies": "#0f4c5c",
      "class_5: Barred Spiral Galaxies": "#3a86ff",
      "class_7: Unbarred Loose Spiral Galaxies": "#ff006e",
      "class_8: Edge-on Galaxies without a Bulge": "#8338ec"
    },
    "defaultColor": "#f4f4f9"
  }
}
```

> **How this works:**
> - `shapeMapping` reads the `predicted_class_display` column. Rows matching listed values get the assigned shape; everything else gets `circle` (the `defaultShape`).
> - `shapeLabels` provides human-readable text for the legend next to each shape icon. Since `shapeMapping` is present, shapes come from the mapping — the labels just describe them.
> - `colorMapping` (categorical, same column) colors each matched class with a distinct color; unmatched values get `#f4f4f9` via `defaultColor`.
> - If you instead wanted a continuous color scale (e.g. by `magnitude`), you would replace the `colorMapping` block with `"type": "continuous"`.

A sample file is available at `public/visualization-config.example.json`.

### Complete example (continuous color + categorical shape)

This example uses a continuous color scale (class probability) combined with categorical shape assignment. Points are colored on a gradient from 0 to 1 while shapes distinguish between classes.

```json
{
  "shapeLabels": {
    "star": "class_0: Disturbed Galaxies",
    "circle": "Other classes"
  },
  "shapeMapping": {
    "column": "target_class_display",
    "categories": {
      "class_0: Disturbed Galaxies": "star"
    },
    "defaultShape": "circle"
  },
  "colorMapping": {
    "type": "continuous",
    "column": "class_0_probability",
    "scale": "linear",
    "min": 0.0,
    "max": 1.0,
    "colorScheme": "viridis"
  }
}
```

> **How this works:**
> - `shapeMapping` reads `target_class_display`: positive-class objects ("class_0: Disturbed Galaxies") are drawn as stars; everything else is drawn as circles via `defaultShape`.
> - `shapeLabels` provides legend text: the star icon is labeled "class_0: Disturbed Galaxies" and the circle is labeled "Other classes".
> - `colorMapping` (continuous) reads the `class_0_probability` column and maps each point's value onto the viridis color gradient. Higher probabilities (closer to 1.0) appear yellow-green; lower probabilities (closer to 0.0) appear dark purple.
> - Color and shape are independent: each point gets a shape from the categorical column and a color from the continuous column.

## Point Size Control

The toolbar includes a Point size slider.

- Default point size is 18.
- You can drag the slider to increase or decrease marker size.
- Use Default 18 in the toolbar to instantly reset to the default size.
