# URL-Based Visualization Loading

The Astronomical Embedding Explorer supports loading embedding data and configuration via HTTP GET query parameters. This enables direct sharing of visualizations through simple URLs without requiring users to manually upload files.

## Query Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `base` | No | Shared root directory URL. When provided, `emb` and `cfg` are resolved relative to this path. |
| `emb`  | Yes | Embedding data file. Supports `.json`, `.csv`, and `.csv.gz` formats. |
| `cfg`  | Yes | Visualization config file. Must be `.json` format. |

## URL Resolution Logic

Each parameter value undergoes a two-step resolution:

1. **Absolute detection** — If the value starts with `http://` or `https://`, it is treated as a standalone full URL and used directly.

2. **Relative resolution** — Otherwise, the value is resolved against the `base` parameter using the browser's native `URL` constructor. This handles path normalization (`.` and `..` segments, trailing slashes, etc.).

3. **Security validation** — Every resolved URL is validated to start with `http://` or `https://` to prevent XSS and `javascript:` protocol injection attacks.

### Resolution Examples

| base | emb | cfg | Resolved emb URL |
|------|-----|-----|------------------|
| `https://example.com/data/` | `embeddings.csv` | `config.json` | `https://example.com/data/embeddings.csv` |
| `https://example.com/data/` | `../other/data.json` | `./cfg.json` | `https://example.com/other/data.json` |
| (not set) | `https://cdn.example.com/data.json` | `https://cdn.example.com/config.json` | `https://cdn.example.com/data.json` |
| `https://example.com/data/` | `https://cdn.example.com/data.json` | `config.json` | `https://cdn.example.com/data.json` (absolute wins) |

## Error Handling

The application wraps the entire loading sequence in a try/catch block and displays a red error banner for any failure:

- **Missing `emb` or `cfg`** — If either required parameter is absent, the app falls back to the default manual-upload UI.
- **Missing `base` with relative values** — If `emb` or `cfg` is relative but no `base` is provided, an error is shown.
- **Invalid URL construction** — If `new URL(relative, base)` throws, an error is shown.
- **Network errors** — HTTP fetch failures during loading are caught and displayed.
- **Parse errors** — Invalid JSON or malformed CSV data results in a clear error message.

## Loading Process

When `emb` and `cfg` are present:

1. Both URLs are resolved to absolute form.
2. **Parallel fetch** — `Promise.all([fetchEmb, fetchCfg])` fires both requests simultaneously.
3. The embedding data is parsed (JSON, CSV, or gzipped CSV) using the same parsing pipeline as manual uploads.
4. The config file is parsed via the existing visualization config parser.
5. Both datasets are passed into the rendering engine only after **both** succeed.
6. A loading spinner is shown during the fetch; errors are displayed in a red banner if either fails.

---

# Generating URLs

## Optimization Strategy: `base` vs. Full URLs

When both the embedding file and config file are hosted in the same directory:

**Use `base` (shorter, cleaner URL):**
```
?base=https://myserver.com/data/run42/&emb=umap_embeddings.csv&cfg=visualization.json
```

When files are on different servers or paths:

**Use full independent URLs:**
```
?emb=https://results.server.com/umap.csv&cfg=https://config.server.com/vis.json
```

All parameter values must be URL-encoded via `encodeURIComponent()`.

**CRITICAL:** Do **not** use Base64, Gzip, or Zlib compression on parameter values. The app parses standard URL query parameters only.

---

## Code Examples

### JavaScript (Browser)

```javascript
/**
 * Build a visualization URL.
 *
 * @param {string} visualizerUrl - Base URL of the embedding viewer app
 *   e.g. "https://visualizer.example.com/"
 * @param {string} embPath - Embedding data file path or full URL
 * @param {string} cfgPath - Config file path or full URL
 * @returns {string} Complete URL with query parameters
 */
function buildVisualizationUrl(visualizerUrl, embPath, cfgPath) {
  const params = new URLSearchParams();
  const embAbs = /^https?:\/\//i.test(embPath);
  const cfgAbs = /^https?:\/\//i.test(cfgPath);

  if (embAbs && cfgAbs) {
    // Different servers/paths — use full URLs, no base
    params.set("emb", encodeURIComponent(embPath));
    params.set("cfg", encodeURIComponent(cfgPath));
  } else if (!embAbs && !cfgAbs) {
    // Both relative — derive base from embPath directory
    const baseDir = embPath.includes("/")
      ? embPath.substring(0, embPath.lastIndexOf("/") + 1)
      : "";
    const embFile = embPath.includes("/")
      ? embPath.substring(embPath.lastIndexOf("/") + 1)
      : embPath;
    const cfgFile = cfgPath.includes("/")
      ? cfgPath.substring(cfgPath.lastIndexOf("/") + 1)
      : cfgPath;

    if (baseDir) {
      // Reconstruct the base as an absolute URL if needed
      // Here we assume the visualizer and data share the same origin
      const baseUrl = new URL(baseDir, visualizerUrl).href;
      params.set("base", encodeURIComponent(baseUrl));
    }
    params.set("emb", encodeURIComponent(embFile));
    params.set("cfg", encodeURIComponent(cfgFile));
  } else {
    // Mixed — one absolute, one relative — use full URLs for both
    params.set("emb", encodeURIComponent(embPath));
    params.set("cfg", encodeURIComponent(cfgPath));
  }

  return visualizerUrl + "?" + params.toString();
}

// Usage examples:
const url1 = buildVisualizationUrl(
  "https://visualizer.example.com/",
  "https://data.example.com/run42/embeddings.csv",
  "https://data.example.com/run42/config.json"
);
// → https://visualizer.example.com/?base=https%3A%2F%2Fdata.example.com%2Frun42%2F&emb=embeddings.csv&cfg=config.json

const url2 = buildVisualizationUrl(
  "https://visualizer.example.com/",
  "https://server-a.com/data.csv",
  "https://server-b.com/config.json"
);
// → https://visualizer.example.com/?emb=https%3A%2F%2Fserver-a.com%2Fdata.csv&cfg=https%3A%2F%2Fserver-b.com%2Fconfig.json
```

### JavaScript (Browser — Minimal Helper)

If you want the simplest approach and don't need the base-optimization:

```javascript
function quickLink(visualizerUrl, embUrl, cfgUrl) {
  const p = new URLSearchParams();
  p.set("emb", encodeURIComponent(embUrl));
  p.set("cfg", encodeURIComponent(cfgUrl));
  return visualizerUrl + "?" + p.toString();
}
```

### JavaScript (Browser — Using the Built-in `buildCompanionUrl`)

The application exports `buildCompanionUrl` from `src/utils/urlResolver.ts`. If you are working within the same codebase:

```typescript
import { buildCompanionUrl } from "./utils/urlResolver";

// Same directory — use base optimization
const link = buildCompanionUrl(
  "https://data.example.com/run42/",  // base
  "embeddings.csv",                    // emb filename
  "config.json"                        // cfg filename
);
// → https://visualizer.example.com/?base=https%3A%2F%2Fdata.example.com%2Frun42%2F&emb=embeddings.csv&cfg=config.json

// Different servers — pass null for base
const link2 = buildCompanionUrl(
  null,
  "https://server-a.com/data.csv",
  "https://server-b.com/config.json"
);
// → https://visualizer.example.com/?emb=https%3A%2F%2Fserver-a.com%2Fdata.csv&cfg=https%3A%2F%2Fserver-b.com%2Fconfig.json
```

### TypeScript

```typescript
import { encodeURIComponent } from "querystring"; // Node.js, or use global encodeURIComponent in browser

interface VizLinkParams {
  visualizerUrl: string;
  embUrl: string;
  cfgUrl: string;
  baseUrl?: string;
}

function generateVizUrl(params: VizLinkParams): string {
  const search = new URLSearchParams();

  if (params.baseUrl) {
    search.set("base", encodeURIComponent(params.baseUrl));
  }
  search.set("emb", encodeURIComponent(params.embUrl));
  search.set("cfg", encodeURIComponent(params.cfgUrl));

  const url = new URL(params.visualizerUrl);
  url.search = search.toString();
  return url.href;
}

// Example
const link = generateVizUrl({
  visualizerUrl: "https://visualizer.example.com/",
  embUrl: "https://data.example.com/run42/embeddings.csv",
  cfgUrl: "https://data.example.com/run42/config.json",
});
```

### Python 3

```python
from urllib.parse import urlencode, urljoin, quote
import os

def build_visualization_url(
    visualizer_url: str,
    emb_path: str,
    cfg_path: str,
) -> str:
    """
    Generate a visualization URL.

    Args:
        visualizer_url: Base URL of the embedding viewer app.
        emb_path: Path or full URL to the embedding data file.
        cfg_path: Path or full URL to the config JSON file.

    Returns:
        Complete URL with query parameters.
    """
    params = {}
    emb_is_abs = emb_path.startswith(("http://", "https://"))
    cfg_is_abs = cfg_path.startswith(("http://", "https://"))

    if emb_is_abs and cfg_is_abs:
        # Different servers — use full URLs, no base
        params["emb"] = quote(emb_path, safe="")
        params["cfg"] = quote(cfg_path, safe="")

    elif not emb_is_abs and not cfg_is_abs:
        # Both relative — use base optimization
        base_dir = os.path.dirname(emb_path)
        emb_file = os.path.basename(emb_path)
        cfg_file = os.path.basename(cfg_path)

        if base_dir:
            # Ensure base_dir ends with / for proper URL resolution
            base_url = base_dir if base_dir.endswith("/") else base_dir + "/"
            params["base"] = quote(base_url, safe="")
        params["emb"] = quote(emb_file, safe="")
        params["cfg"] = quote(cfg_file, safe="")

    else:
        # Mixed — full URLs for both
        params["emb"] = quote(emb_path, safe="")
        params["cfg"] = quote(cfg_path, safe="")

    query_string = urlencode(params)
    return visualizer_url.rstrip("/") + "/?" + query_string


# Usage examples:

# 1. Same directory — uses base parameter
url1 = build_visualization_url(
    visualizer_url="https://visualizer.example.com/",
    emb_path="run42/embeddings.csv",
    cfg_path="run42/config.json",
)
print(url1)
# → https://visualizer.example.com/?base=run42%2F&emb=embeddings.csv&cfg=config.json


# 2. Full URLs without base
url2 = build_visualization_url(
    visualizer_url="https://visualizer.example.com/",
    emb_path="https://data.example.com/run42/embeddings.csv",
    cfg_path="https://data.example.com/run42/config.json",
)
print(url2)
# → https://visualizer.example.com/?emb=https%3A%2F%2Fdata.example.com%2Frun42%2Fembeddings.csv&cfg=https%3A%2F%2Fdata.example.com%2Frun42%2Fconfig.json


# 3. With an explicit absolute base URL
def build_visualization_url_with_base(
    visualizer_url: str,
    base_url: str,
    emb_file: str,
    cfg_file: str,
) -> str:
    """When you know the base URL explicitly."""
    params = {
        "base": quote(base_url, safe=""),
        "emb": quote(emb_file, safe=""),
        "cfg": quote(cfg_file, safe=""),
    }
    return visualizer_url.rstrip("/") + "/?" + urlencode(params)

url3 = build_visualization_url_with_base(
    visualizer_url="https://visualizer.example.com/",
    base_url="https://data.example.com/run42/",
    emb_file="umap_embeddings.csv",
    cfg_file="visualization.json",
)
print(url3)
# → https://visualizer.example.com/?base=https%3A%2F%2Fdata.example.com%2Frun42%2F&emb=umap_embeddings.csv&cfg=visualization.json
```

### Python 3 (Minimal)

```python
from urllib.parse import urlencode, quote

def quick_link(visualizer_url: str, emb_url: str, cfg_url: str) -> str:
    params = {
        "emb": quote(emb_url, safe=""),
        "cfg": quote(cfg_url, safe=""),
    }
    return visualizer_url.rstrip("/") + "/?" + urlencode(params)

# Usage
link = quick_link(
    "https://visualizer.example.com/",
    "https://data.example.com/embeddings.csv",
    "https://data.example.com/config.json",
)
```

### curl (Command Line)

```bash
# Direct URL with query parameters
curl "https://visualizer.example.com/?emb=https%3A%2F%2Fdata.example.com%2Fdata.csv&cfg=https%3A%2F%2Fdata.example.com%2Fconfig.json"

# Generate URL from file paths
BASE="https://data.example.com/run42/"
VISUALIZER="https://visualizer.example.com/"
python3 -c "
from urllib.parse import urlencode, quote
params = {'base': quote('$BASE', safe=''), 'emb': 'embeddings.csv', 'cfg': 'config.json'}
print('${VISUALIZER}?' + urlencode(params))
"
```

### Bash (Helper Function)

```bash
#!/usr/bin/env bash
# Generate a visualization URL

generate_viz_url() {
    local visualizer_url="$1"
    local emb_url="$2"
    local cfg_url="$3"

    # URL-encode each parameter
    local emb_encoded
    local cfg_encoded
    emb_encoded=$(python3 -c "from urllib.parse import quote; print(quote('${emb_url}', safe=''))")
    cfg_encoded=$(python3 -c "from urllib.parse import quote; print(quote('${cfg_url}', safe=''))")

    echo "${visualizer_url}?emb=${emb_encoded}&cfg=${cfg_encoded}"
}

# Usage
generate_viz_url \
    "https://visualizer.example.com/" \
    "https://data.example.com/run42/embeddings.csv" \
    "https://data.example.com/run42/config.json"
```

---

## Supported File Formats

### Embedding Data (`emb`)

| Format   | Extension   | Notes |
|----------|-------------|-------|
| JSON     | `.json`     | Object with `objects` array. Each object must have `coadd_object_id`, `embedding_x`, `embedding_y`, `image_url`. |
| CSV      | `.csv`      | Comma-separated values with header row. Columns: `coadd_object_id`, `embedding_x`, `embedding_y`, `image_url`. |
| Gzipped CSV | `.csv.gz` | CSV compressed with gzip. Parsed via `DecompressionStream` + PapaParse. |

### Visualization Config (`cfg`)

| Format   | Extension   | Notes |
|----------|-------------|-------|
| JSON     | `.json`     | Object with `shapeLabels` (shape-to-label map) and `colorMapping` (continuous or categorical). |

### Example Config JSON

```json
{
  "shapeLabels": {
    "star": "Candidate",
    "circle": "Confirmed",
    "diamond": "Flagged"
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

---

## CORS Requirements

Both the embedding data server and config server must include appropriate CORS headers to allow cross-origin requests from the visualizer's domain:

```
Access-Control-Allow-Origin: https://visualizer.example.com
```

For public visualizer deployments, use:

```
Access-Control-Allow-Origin: *
```

---

## Security Considerations

- Only `http://` and `https://` URL schemes are accepted. Any attempt to use `javascript:`, `data:`, `file:`, or other schemes is rejected during URL validation.
- All parameter values are resolved through the browser's `URL` constructor, which normalizes paths and prevents path traversal attacks.
- The `encodeURIComponent()` function is used for all URL generation to prevent injection.
- No Base64, Gzip, or Zlib compression is used for parameter values — all data is passed as standard URL query parameters.
