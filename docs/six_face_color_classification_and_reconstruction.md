# Six-Face Color Classification & Canonical Cube State Reconstruction (Phase 4C)

## 1. Overview & Objective

Phase 4C extends the single-face computer vision pipeline into a comprehensive 6-face scanning, center-calibrated color classification, globally balanced (exactly 9 stickers per color) state reconstruction, and interactive review workflow.

```
6 Captured Cube Faces (54 Facelets)
        ↓
Center-Based Color Reference Calibration (U=White, R=Red, F=Green, D=Yellow, L=Orange, B=Blue)
        ↓
Feature Distance Metric (Circular Hue, Saturation, Value & RGB Distance)
        ↓
Global 6-Color Constrained Classification (Exactly 9 Stickers Per Color Group)
        ↓
Canonical 54-Facelet URFDLB String Construction
        ↓
Interactive 6-Face Review, Ambiguity Flagging & Manual Correction UI
        ↓
Integration with 3D Solver Workspace & Backend Validation Gate
```

---

## 2. Physical Cube Scanning Protocol & Rotation Instructions

To maintain deterministic spatial alignment between captured camera frames and canonical 54-facelet indices, the user follows this exact scanning sequence:

| Step | Target Face | Center Color | Physical Orientation & Cube Rotation | Canonical Index Range |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Up (`U`)** | White (`#f8fafc`) | Hold White facing camera, Green facing down (towards user). | `0` – `8` (Center = `4`) |
| **2** | **Right (`R`)** | Red (`#ef4444`) | Rotate cube 90° right: White on top, Red facing camera. | `9` – `17` (Center = `13`) |
| **3** | **Front (`F`)** | Green (`#22c55e`) | Rotate cube back to Front: White on top, Green facing camera. | `18` – `26` (Center = `22`) |
| **4** | **Down (`D`)** | Yellow (`#eab308`) | Tilt cube up 90°: Green on top, Yellow facing camera. | `27` – `35` (Center = `31`) |
| **5** | **Left (`L`)** | Orange (`#f97316`) | Rotate cube 90° left: White on top, Orange facing camera. | `36` – `44` (Center = `40`) |
| **6** | **Back (`B`)** | Blue (`#3b82f6`) | Rotate cube 180° to Back: White on top, Blue facing camera. | `45` – `53` (Center = `49`) |

---

## 3. Center-Based Color Calibration

Instead of brittle hardcoded RGB thresholds, the system dynamically calibrates color reference anchors from the **6 captured center stickers** ($[4, 13, 22, 31, 40, 49]$):

- $U_{\text{center}}$ $\rightarrow$ White reference vector
- $R_{\text{center}}$ $\rightarrow$ Red reference vector
- $F_{\text{center}}$ $\rightarrow$ Green reference vector
- $D_{\text{center}}$ $\rightarrow$ Yellow reference vector
- $L_{\text{center}}$ $\rightarrow$ Orange reference vector
- $B_{\text{center}}$ $\rightarrow$ Blue reference vector

Each reference vector records $[\bar{R}, \bar{G}, \bar{B}]$, $[H, S, V]$, and luminance $Y$.

---

## 4. Multi-Feature Color Distance Metric

The distance $D(\text{sample}, \text{reference})$ evaluates similarity under varying lighting conditions:

$$D = w_H \cdot \Delta H_{\text{circular}} + w_S \cdot \Delta S + w_V \cdot \Delta V + w_{\text{rgb}} \cdot \Delta RGB$$

### Key Specialized Heuristics:
1. **White Identification**: White is characterized by low saturation ($S < 28\%$) and high luminance ($Y > 150$). Saturated color samples comparing against White receive a large penalty ($+1.5$).
2. **Red vs. Orange Discrimination**: Both colors share warm hues ($H \in [0^\circ, 35^\circ]$); the metric applies higher weight ($w_H = 1.4$) on the hue boundary ($0^\circ$ for Red vs $25^\circ$ for Orange).
3. **Yellow vs. White/Orange**: Yellow is distinguished by high saturation ($S > 45\%$) and characteristic hue near $45^\circ-55^\circ$.

---

## 5. Global 6-Color Classification & 9-Per-Color Constrained Balancing

A valid Rubik's Cube has **exactly 9 stickers of each color** (1 center + 8 non-centers). Classifying each sticker independently can produce impossible counts (e.g. 10 Reds and 8 Whites).

### Constrained Balancing Algorithm:
1. **Center Fixation**: The 6 centers are immutably assigned to their canonical colors.
2. **Confidence-Sorted Greedy Allocation**: Non-center stickers are sorted by classification margin:
   $$\text{Confidence}_i = \frac{D_{\text{second}} - D_{\text{first}}}{D_{\text{second}} + D_{\text{first}}}$$
   Highest-certainty stickers claim capacity in their preferred color group first.
3. **Cost-Minimizing Augmenting Assignment**: Any remaining unassigned stickers whose preferred colors are full are mapped to the next best available color group with remaining capacity, minimizing total color distance distortion.
4. **Ambiguity Flagging**: Stickers assigned with confidence $< 0.40$ or reassigned during balancing are flagged with `isAmbiguous = true`.

---

## 6. Interactive Review & Manual Correction UI (`ScanReconstructionReview.jsx`)

When all 6 faces are captured:
1. **2D Unfolded Cross Layout Preview**: Displays all 54 facelets in canonical net arrangement.
2. **Ambiguity Highlights**: Ambiguous stickers are marked with distinct yellow borders and warning badges.
3. **In-Place Color Correction**: Users can select any WCA palette tool ($U, R, F, D, L, B$) and click non-center stickers to correct misclassifications.
4. **Color Distribution Counters**: Dynamic $X/9$ badges guarantee that all colors equal 9 before enabling the commit button.
5. **Per-Face Rescan Trigger**: Allows rescanning any individual face without losing progress on the other 5 faces.
6. **One-Click Workspace Commit**: Commits the verified 54-character state into `CubeContext`, instantly updating the interactive 3D Cube visualizer and solution pipeline.

---

## 7. Status & Phase Summary

- **Phase 4A**: Camera stream, permissions, 6-face capture sequence, reticle HUD $\rightarrow$ `IMPLEMENTED`
- **Phase 4B**: Single-face CV pipeline, grid estimation, color extraction, confidence scoring $\rightarrow$ `IMPLEMENTED`
- **Phase 4C**: 6-Face color clustering, center calibration, 9-count global balancing, 2D review UI, and solver commit $\rightarrow$ `IMPLEMENTED`
