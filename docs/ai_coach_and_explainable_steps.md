# AI Coach & Explainable Solution Steps (Phase 5B)

## 1. Overview & Objective

Phase 5B transforms CubeMind from a move-sequence solver into an explainable, interactive solving coach.

```
Verified Solution Move Sequence
        ↓
Deterministic Rule-Based Explanation Engine (CoachExplainer)
        ↓
Structured CoachingStep Model (Factual Breakdown & Grip Hints)
        ↓
Conservative Pattern & Trigger Recognizer (Sexy Move, Sune, Anti-Sune, T-Perm)
        ↓
Interactive Frontend CoachPanel Synchronized with 3D Playback Controller
```

---

## 2. Structured Coaching Step Model

Each step is defined by a structured `CoachingStep`:
- **`step_number` / `total_steps`**: 1-indexed step progression.
- **`move`**: Canonical move token (e.g. `R`, `U'`, `F2`).
- **`move_name`**: Human-readable name (e.g. "Right Inverted / Counter-Clockwise").
- **`face_name` / `face_color`**: Physical face identification (e.g. "Right Face (Red)").
- **`direction`**: "Clockwise (90°)", "Counter-Clockwise (90°)", or "Double Turn (180°)".
- **`turn_type`**: "Quarter Turn (90°)" or "Half Turn (180°)".
- **`instruction`**: Actionable physical turning instruction.
- **`explanation`**: Factual explanation of piece repositioning.
- **`hint`**: Mechanical grip and ergonomic turning advice.
- **`pattern_name` / `pattern_confidence`**: Trigger metadata (if matching known algorithm).
- **`playback_index`**: 0-indexed animation controller pointer.

---

## 3. Explainability Accuracy & Safe Intent Reporting

The engine enforces strict separation between:
1. **Verified Facts**: Physical face, turn angle, rotation direction, and step numbering.
2. **Heuristic Hints**: Ergonomic finger-trick advice and physical hand grip cues.
3. **General Strategic Intent**: When cubie-level intention cannot be derived without speculation, safe, honest terminology is used (e.g. *"This move repositions edge and corner pieces towards their target orbits without disturbing center alignment"*).

---

## 4. Conservative Pattern & Micro-Algorithm Recognition

Matches exact sub-sequences from a deterministic pattern library:
- **Sexy Move Trigger**: `R U R' U'` (Top-right corner/edge cycle)
- **Inverse Sexy Move**: `U R U' R'` (F2L pairing trigger)
- **Left Sexy Move**: `L' U' L U` (Mirrored left-handed trigger)
- **Sune Orientation**: `R U R' U R U2 R'` (Top corner orientation)
- **Anti-Sune**: `R U2 R' U' R U' R'` (Inverse corner orientation)
- **T-Perm Fragment**: `R U R' U' R' F R2 U' R' U' R U R' F'` (Corner-edge swap)

---

## 5. Dual Coach Modes

- **Beginner Mode**: Comprehensive guidance including physical grip hints, face color highlights, and in-depth explanations.
- **Compact Mode**: Minimalist speedsolving view with concise directional instructions and compact badges.

---

## 6. Real-Time Playback Synchronization

- `CoachPanel.jsx` subscribes to `playbackStatus` and `currentStepIndex` in `CubeContext`.
- Advances automatically as 3D playback progresses.
- Supports jumping to arbitrary steps, pause/resume, and celebration banners upon solution completion.
