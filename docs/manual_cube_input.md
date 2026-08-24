# Manual Cube Input & State Editing Specification

**Status**: IMPLEMENTED (Phase 3C)  
**Scope**: Frontend Manual State Input, 2D Net Editor, 3D Raycasting, and Validation UX

---

## 1. Overview & Objectives

Phase 3C establishes a professional, intuitive, and mathematically synchronized manual state editing system for CubeMind. Users can construct custom scrambled states, inspect cube configurations, fix misoriented stickers, and prepare the cube for algorithmic solving via Kociemba Two-Phase IDA*.

### Core Capabilities
* **Interactive 2D Unfolded Cube Net**: 54-sticker layout following standard unfolded geometry (Up on top; Left, Front, Right, Back in center; Down on bottom).
* **Direct 3D Raycast Painting**: Click directly on visible cubie facelets in the 3D WebGL canvas to select or paint colors with real-time feedback.
* **WCA Color Palette**: Instant switching between standard Western color scheme (`U`=White, `R`=Red, `F`=Green, `D`=Yellow, `L`=Orange, `B`=Blue) with live sticker distribution counters ($X/9$).
* **Center Sticker Protection**: Fixed reference center axes (`U`=4, `R`=13, `F`=22, `D`=31, `L`=40, `B`=49) are locked to prevent invalid reference rotations.
* **Non-Destructive History**: 50-step Undo (`Ctrl+Z`), Redo (`Ctrl+Y` / `Ctrl+Shift+Z`), and Reset to Solved state.
* **Deep Real-Time Validation UX**: Instant client-side format checks combined with debounced backend physical invariant validation (edge flips, corner twists, permutation parity).
* **State String Import**: Paste/copy canonical 54-character URFDLB strings with instant syntax validation.

---

## 2. Architecture & Data Flow

```
   ┌─────────────────────────────────────────────────────────────┐
   │                       User Input                            │
   │  ┌───────────────────────┐       ┌───────────────────────┐  │
   │  │ 2D Interactive Net    │       │ 3D Raycast Canvas     │  │
   │  │ (Click sticker/color) │       │ (Click cubie facelet) │  │
   │  └───────────┬───────────┘       └───────────┬───────────┘  │
   │              │                               │              │
   │              │   Keyboard (1-6, Ctrl+Z/Y)    │              │
   │              └───────────────┬───────────────┘              │
   └──────────────────────────────┼──────────────────────────────┘
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │               CubeContext (Canonical State)                 │
   │  - stateString: "UUUUUUUUURRRRRRRRRFFFFFFFFF..." (54 chars) │
   │  - selectedColor: 'U' | 'R' | 'F' | 'D' | 'L' | 'B'         │
   │  - selectedStickerIndex: 0..53                              │
   │  - history: [state_0, state_1, ...] (Max 50)                │
   │  - future: [state_next, ...]                                │
   │  - Center protection gate: rejects center modifications     │
   └───────────────┬──────────────────────────────┬──────────────┘
                   │                              │
     ┌─────────────┴────────────┐    ┌────────────┴─────────────┐
     ▼                          ▼    ▼                          ▼
┌──────────────┐   ┌──────────────┐ ┌──────────────┐   ┌──────────────┐
│  2D Net UI   │   │  3D Three.js │ │StateInspector│   │Validation UX │
│(Face grids)  │   │  (26 Cubies) │ │(54-char/cnts)│   │(Debounced API│
└──────────────┘   └──────────────┘ └──────────────┘   │  /validate)  │
                                                       └──────┬───────┘
                                                              ▼
                                                       ┌──────────────┐
                                                       │ Ready to     │
                                                       │ Solve Gate   │
                                                       └──────────────┘
```

---

## 3. 2D Cube Net Layout & Index Mapping

The 2D Net unfolds the 6 cube faces into an intuitive cross layout matching the canonical face order:

```text
               +------------+
               |  0   1   2 |
               |  3  [4]  5 |  (U - Up / White)
               |  6   7   8 |
+------------+------------+------------+------------+
| 36  37  38 | 18  19  20 |  9  10  11 | 45  46  47 |
| 39 [40] 41 | 21 [22] 23 | 12 [13] 14 | 48 [49] 50 |  (L, F, R, B)
| 42  43  44 | 24  25  26 | 15  16  17 | 51  52  53 |
+------------+------------+------------+------------+
               | 27  28  29 |
               | 30 [31] 32 |  (D - Down / Yellow)
               | 33  34  35 |
               +------------+
```

### Center Sticker Indices
| Face | Name | Default Color | Canonical Center Index | Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **U** | Up | White (`U`) | `4` | Locked (Axis Anchor) |
| **R** | Right | Red (`R`) | `13` | Locked (Axis Anchor) |
| **F** | Front | Green (`F`) | `22` | Locked (Axis Anchor) |
| **D** | Down | Yellow (`D`) | `31` | Locked (Axis Anchor) |
| **L** | Left | Orange (`L`) | `40` | Locked (Axis Anchor) |
| **B** | Back | Blue (`B`) | `49` | Locked (Axis Anchor) |

---

## 4. 3D Raycasting & Direct Painting

### Raycast Face Detection
Each of the 26 outer `Cubie` meshes is built with Three.js `BoxGeometry`, having 6 material faces:
- `materialIndex: 0` $\rightarrow$ Right (+X)
- `materialIndex: 1` $\rightarrow$ Left (-X)
- `materialIndex: 2` $\rightarrow$ Up (+Y)
- `materialIndex: 3` $\rightarrow$ Down (-Y)
- `materialIndex: 4` $\rightarrow$ Front (+Z)
- `materialIndex: 5` $\rightarrow$ Back (-Z)

When a pointer click event occurs on a cubie mesh:
1. `e.face.materialIndex` identifies the clicked face.
2. `faceIndices` translates the spatial face to the absolute canonical sticker index (0..53).
3. If valid ($0 \le \text{idx} < 54$), `setStickerColor(idx, selectedColor)` is invoked.
4. Active hover / selected highlight shaders add emissive glow (`#38bdf8` / `#ffffff`) to provide immediate tactile feedback.

---

## 5. Validation UX & Rules Breakdown

Validation runs in two stages:

1. **Immediate Frontend Structural Check**:
   - String length $\equiv 54$.
   - Valid character set $\in \{U, R, F, D, L, B\}$.
   - Fixed center alignments ($4=U, 13=R, 22=F, 31=D, 40=L, 49=B$).
   - Exact 9-count distribution per face.

2. **Debounced Backend Deep Mathematical Validation (350ms)**:
   - Evaluates physical edge orbits and orientation parity ($\sum \text{flip} \equiv 0 \pmod 2$).
   - Evaluates physical corner orbits and orientation parity ($\sum \text{twist} \equiv 0 \pmod 3$).
   - Verifies total permutation parity ($\text{sgn}(\pi_c) = \text{sgn}(\pi_e)$).

### User Status Feedback
* **SOLVABLE** (Green badge): Ready for instant Kociemba solving.
* **INVALID CONFIGURATION** (Amber badge): Structural or distribution defect (e.g. 10 whites, 8 reds).
* **UNSOLVABLE STATE** (Red badge): Mathematically impossible state (e.g. twisted corner or flipped edge).
* **VALIDATING...** (Cyan spinner): Asynchronous deep check in flight.

---

## 6. Hotkeys & Controls

| Action | Shortcut |
| :--- | :--- |
| Select White (`U`) | `1` or `U` |
| Select Red (`R`) | `2` or `R` |
| Select Green (`F`) | `3` or `F` |
| Select Yellow (`D`) | `4` or `D` |
| Select Orange (`L`) | `5` or `L` |
| Select Blue (`B`) | `6` or `B` |
| Undo Edit | `Ctrl + Z` / `Cmd + Z` |
| Redo Edit | `Ctrl + Y` / `Ctrl + Shift + Z` |
| Reset State | Button in Palette |
| Paste String | `Paste` button in Palette |

---

## 7. Known Limitations & Non-Goals

1. **Solution Playback**: Step-by-step move playback is planned for Phase 3D.
2. **Camera Computer Vision**: Live camera capture and image recognition will be delivered in Phase 4.
