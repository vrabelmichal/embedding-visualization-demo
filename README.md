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

Use Upload config in the toolbar to apply optional visualization overrides from a JSON file.

Supported overrides:

- shapeLabels: custom display labels for shapes in the legend.
- colorMapping: choose continuous or categorical behavior.

Example continuous mapping:

```json
{
  "shapeLabels": {
    "star": "Candidate",
    "circle": "Confirmed"
  },
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

Example categorical mapping:

```json
{
  "colorMapping": {
    "type": "categorical",
    "column": "class",
    "categories": {
      "spiral": "#f97316",
      "elliptical": "#0ea5e9"
    }
  }
}
```

Categorical categories also accept a color-to-label dictionary:

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

Notes:

- For continuous mapping, scale supports linear, log, and quantile.
- For categorical mapping, the selected column value is matched against category keys or labels.
- A sample file is available at public/visualization-config.example.json.

## Point Size Control

The toolbar includes a Point size slider.

- Default point size is 18.
- You can drag the slider to increase or decrease marker size.
- Use Default 18 in the toolbar to instantly reset to the default size.
