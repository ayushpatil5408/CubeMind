# Interactive 3D Rubik's Cube Model Specification

**Status**: IMPLEMENTED (Phase 3B)  
**Package**: `frontend/src/components/3d/`  
**Core Technologies**: Three.js, React Three Fiber (`@react-three/fiber`), `@react-three/drei`

---

## 1. Overview & 3D Visual Architecture

The 3D Rubik's Cube model serves as the primary visual centerpiece of CubeMind. It transforms the canonical 54-facelet state string (`URFDLB`) into a fully interactive, physically grounded 3D WebGL scene rendered in real-time.

```text
               Canonical 54-Facelet State String (e.g. SOLVED_STATE_STRING)
                                         │
                                         ▼
                      mapStateTo3DCubies(stateString)
                       (src/utils/cube3DMapping.js)
                                         │
                                         ▼
                 26 Cubie Specifications with Spatial Coordinates (x, y, z)
                 and 6-Face Material Colors [+X, -X, +Y, -Y, +Z, -Z]
                                         │
                                         ▼
                          RubiksCube3D.jsx (<group>)
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
             Cubie 1 (mesh)                              Cubie 26 (mesh)
             ├── BoxGeometry (0.94 x 0.94 x 0.94)        ├── BoxGeometry
             └── 6x MeshStandardMaterial                 └── 6x MeshStandardMaterial
```

---

## 2. Spatial Coordinate System & Facelet Index Mapping

The 3D cube is constructed in a right-handed Cartesian coordinate space with origin $(0, 0, 0)$ at the center of the core:
- **$+X$**: Right ($R$) Face (Red, `#ef4444`)
- **$-X$**: Left ($L$) Face (Orange, `#f97316`)
- **$+Y$**: Up ($U$) Face (White, `#f8fafc`)
- **$-Y$**: Down ($D$) Face (Yellow, `#eab308`)
- **$+Z$**: Front ($F$) Face (Green, `#22c55e`)
- **$-Z$**: Back ($B$) Face (Blue, `#3b82f6`)

### Coordinate to Facelet Index Formula
For any cubie position $(x, y, z) \in \{-1, 0, 1\}^3$, the outer face stickers map to canonical indices $(0 \dots 53)$ as follows:

| Face | Normal Vector | Coordinate Range | Facelet Index Formula | Canonical Range |
| :--- | :--- | :--- | :--- | :--- |
| **Up ($U$)** | $+Y$ ($y = +1$) | $z \in \{-1, 0, 1\}$, $x \in \{-1, 0, 1\}$ | $(z + 1) \times 3 + (x + 1)$ | $0 \dots 8$ |
| **Right ($R$)** | $+X$ ($x = +1$) | $y \in \{+1, 0, -1\}$, $z \in \{+1, 0, -1\}$ | $9 + (1 - y) \times 3 + (1 - z)$ | $9 \dots 17$ |
| **Front ($F$)** | $+Z$ ($z = +1$) | $y \in \{+1, 0, -1\}$, $x \in \{-1, 0, 1\}$ | $18 + (1 - y) \times 3 + (x + 1)$ | $18 \dots 26$ |
| **Down ($D$)** | $-Y$ ($y = -1$) | $z \in \{+1, 0, -1\}$, $x \in \{-1, 0, 1\}$ | $27 + (1 - z) \times 3 + (x + 1)$ | $27 \dots 35$ |
| **Left ($L$)** | $-X$ ($x = -1$) | $y \in \{+1, 0, -1\}$, $z \in \{-1, 0, +1\}$ | $36 + (1 - y) \times 3 + (z + 1)$ | $36 \dots 44$ |
| **Back ($B$)** | $-Z$ ($z = -1$) | $y \in \{+1, 0, -1\}$, $x \in \{+1, 0, -1\}$ | $45 + (1 - y) \times 3 + (1 - x)$ | $45 \dots 53$ |

Internal faces between cubies are shaded with dark matte plastic (`#111827`).

---

## 3. Camera Interaction & View Presets

Camera control is powered by `@react-three/drei`'s `OrbitControls`:
- **Default Position**: `[3.8, 3.2, 4.5]` with $42^\circ$ Field of View (optimal isometric triad viewing $U, F, R$ faces).
- **Damping**: Smooth inertial rotation (`enableDamping: true`, `dampingFactor: 0.06`).
- **Distance Clamping**: `minDistance: 3.2`, `maxDistance: 14.0`.
- **Camera Angle Presets**:
  - `Isometric`: Default angle `[3.8, 3.2, 4.5]`
  - `Front (F)`: Orthogonal `[0, 0, 6.2]`
  - `Top (U)`: Orthogonal `[0, 6.2, 0.01]`
  - `Right (R)`: Orthogonal `[6.2, 0, 0]`
  - `Back (B)`: Orthogonal `[0, 0, -6.2]`
  - `Down (D)`: Orthogonal `[0, -6.2, 0.01]`
  - `Left (L)`: Orthogonal `[-6.2, 0, 0]`
- **Reset Camera**: One-click camera reset button returning to default view.

---

## 4. Performance & Material Optimization

1. **Shared Materials Cache**: To prevent WebGL shader recompilation and garbage collection thrashing, standard facelet materials (`MeshStandardMaterial`) are cached globally by color key in `Cubie.jsx`.
2. **Geometry Efficiency**: Each cubie uses a clean box geometry with dimensions `0.94 x 0.94 x 0.94`, creating realistic `0.06` sticker gaps without requiring heavy chamfer subdivisions.
3. **Memoized Mapping**: `RubiksCube3D` memoizes the 26-cubie dataset using `useMemo(..., [stateString])`, ensuring re-rendering occurs only when the underlying state string changes.
4. **Error Boundary**: `WebGLErrorBoundary` traps WebGL context loss or headless browser environments without crashing the host React application.

---

## 5. Feature Status & Roadmap

- [x] **IMPLEMENTED (Phase 3B)**: 3D Rubik's Cube model with 26 distinct cubies and realistic sticker spacing.
- [x] **IMPLEMENTED (Phase 3B)**: Bidirectional canonical 54-facelet state synchronization.
- [x] **IMPLEMENTED (Phase 3B)**: Studio 3-point lighting setup (ambient, key, fill, rim).
- [x] **IMPLEMENTED (Phase 3B)**: Orbit/drag camera controls with zoom limits and inertial damping.
- [x] **IMPLEMENTED (Phase 3B)**: Camera angle presets and one-click camera reset.
- [x] **IMPLEMENTED (Phase 3B)**: 2D Net vs 3D Canvas view toggle.
- [ ] **PLANNED (Phase 3C)**: Interactive 3D sticker painting and manual color picker.
- [ ] **PLANNED (Phase 3D)**: Smooth 90°/180° layer rotation animations linked to solver move playback.
- [ ] **EXPERIMENTAL (Phase 5)**: High-resolution PBR sticker textures with micro-scratches and reflections.
