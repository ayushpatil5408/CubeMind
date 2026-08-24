# Computer Vision Face Grid Detection & Color Extraction (Phase 4B)

## 1. Overview & Objective

Phase 4B implements the single-face computer vision pipeline for CubeMind. Given a captured video frame from the camera stream, the pipeline executes:

```
Captured Frame (Canvas / ImageData)
      ↓
Image Quality Assessment (Laplacian Blur, Darkness, Brightness, Saturation)
      ↓
Cube Face / Candidate Region Detection (Automatic High-Contrast Quad & Reticle Guided Fallback)
      ↓
Deterministic 3×3 Grid Estimation (Row-Major 0..8 Cells)
      ↓
Safe Inner-Margin Sticker Sampling (Excluding Black Borders & Plastic Gaps)
      ↓
Statistical Color Feature Extraction (RGB Mean/Median, HSV, Brightness, Saturation, Variance)
      ↓
Multi-Factor Confidence Scoring & Actionable User Guidance
      ↓
Interactive Face Scan Preview & Quality Inspection (Good / Review / Retry)
```

> [!NOTE]
> Phase 4B strictly handles **single-face** extraction and inspection. Global 6-face color classification and 54-facelet canonical cube reconstruction are reserved for Phase 4C.

---

## 2. Architecture & Modular CV Layer

All computer vision logic is isolated under `frontend/src/cv/`:

```
frontend/src/cv/
  ├── types.js            # Detection modes, confidence enums, quality flags, grid order
  ├── imageProcessing.js   # ImageData extraction, grayscale conversion, ROI cropping
  ├── imageQuality.js      # Laplacian variance blur metric, exposure & saturation checks
  ├── faceDetection.js     # Face candidate detection & guided bounding box calculation
  ├── gridDetection.js     # 3x3 grid partitioning & safe inner sampling geometry
  ├── stickerSampling.js   # Pixel collection, IQR outlier filtering, variance calculation
  ├── colorAnalysis.js     # Mean/median RGB, RGB->HSV, Rec.601 brightness, hex formatter
  ├── confidence.js        # Multi-factor weighted confidence evaluator & user advice engine
  ├── pipeline.js          # Unified processCapturedFace orchestrator
  └── index.js             # Public API exports
```

---

## 3. Deterministic 3×3 Grid Coordinate Ordering

The 9 sticker cells on the detected cube face are deterministically indexed in row-major order:

```
+-----------+-----------+-----------+
|     0     |     1     |     2     |   Row 0: Top-Left,    Top-Center,    Top-Right
+-----------+-----------+-----------+
|     3     |     4     |     5     |   Row 1: Middle-Left, Center (Anchor), Middle-Right
+-----------+-----------+-----------+
|     6     |     7     |     8     |   Row 2: Bottom-Left, Bottom-Center, Bottom-Right
+-----------+-----------+-----------+
```

### Key Grid Rules:
- **Cell 4** is always the fixed Center sticker (anchor for face identification and orientation).
- **Safe Inner Sampling Ratio**: By default, each cell samples its inner 50% area ($w_{\text{sample}} = 0.50 \cdot w_{\text{cell}}$, $h_{\text{sample}} = 0.50 \cdot h_{\text{cell}}$). This strictly avoids sampling black plastic borders, chamfered edges, and specular reflections along seams.

---

## 4. Image Quality Checks & Thresholds

| Quality Metric | Method / Formula | Threshold / Trigger | Actionable User Guidance |
| :--- | :--- | :--- | :--- |
| **Blur / Sharpness** | Discrete 3x3 Laplacian Variance on Grayscale | Variance $< 35.0$ | `"Hold the camera steady to reduce motion blur."` |
| **Underexposure** | Mean Rec. 601 Luminance & Dark Pixel Ratio | Luma $< 35.0$ or Dark Ratio $> 55\%$ | `"Lighting is too dark. Move into a brighter area or turn on a light."` |
| **Overexposure / Glare** | Mean Luminance & Saturated Pixel Ratio | Luma $> 225.0$ or Bright Ratio $> 35\%$ | `"Strong glare or reflection detected. Tilt the cube slightly away from the light."` |
| **Low Saturation** | Average HSV Saturation | Saturation $< 8.0\%$ | `"Colors appear faint. Ensure ambient light is white rather than colored."` |

---

## 5. Statistical Color Feature Extraction

For every cell $i \in [0..8]$, the system extracts rich statistical properties:
- **Mean RGB**: $[\bar{R}, \bar{G}, \bar{B}] = \frac{1}{N}\sum [R_j, G_j, B_j]$
- **Median RGB**: Midpoint value along sorted channel distributions (resilient to isolated scratches/dust).
- **HSV Representation**:
  - $H \in [0^\circ, 360^\circ)$
  - $S \in [0\%, 100\%]$
  - $V \in [0\%, 100\%]$
- **Brightness / Luminance**: $Y = 0.299 R + 0.587 G + 0.114 B$
- **Variance**: Internal dispersion of sampled pixels (low variance $< 200$ signifies a uniform, pristine sticker).

---

## 6. Multi-Factor Confidence Scoring

Overall confidence is calculated via a weighted composite:

$$\text{Confidence} = 0.35 \cdot Q_{\text{image}} + 0.35 \cdot C_{\text{face}} + 0.30 \cdot C_{\text{stickers}}$$

- **`GOOD` ($\ge 75\%$)**: Scan is crisp, balanced, and ready for automatic acceptance.
- **`WARNING` ($50\% - 74\%$)**: Review recommended; minor lighting or alignment issue present.
- **`FAILED` ($< 50\%$)**: Retake required; unacceptable blur, pitch darkness, or severe glare.

---

## 7. Guided Reticle Fallback Strategy

When ambient lighting or background clutter inhibits automatic edge contour extraction, the system automatically engages the **Guided Fallback Mode**:
1. Uses the HUD reticle dimensions (centered $65\%$ frame region).
2. Divides the guided region into deterministic 3×3 grid coordinates.
3. Samples the 9 inner zones and records the detection status as `guided_fallback`.
4. Visual tag `Guided` is presented to the user in the UI.

---

## 8. Status & Phase Separation

- **Phase 4A**: Camera stream, permissions, 6-face sequence, reticle HUD $\rightarrow$ `IMPLEMENTED`
- **Phase 4B**: Single-face CV pipeline, grid estimation, color extraction, confidence scoring, inspection preview $\rightarrow$ `IMPLEMENTED`
- **Phase 4C**: 6-Face color clustering, WCA calibration, 54-facelet cube reconstruction $\rightarrow$ `PLANNED`
