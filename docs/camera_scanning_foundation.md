# Camera Foundation & Cube Scanning Interface Specification

**Status**: IMPLEMENTED (Phase 4A)  
**Scope**: Camera Permissions, Stream Lifecycle Management, 3x3 Reticle Overlay, 6-Face Scan Session Flow, and High-Resolution Frame Capture.

---

## 1. Objectives & Overview

Phase 4A establishes the camera foundation and user scanning interface for CubeMind. This phase provides safe, responsive access to the device camera using browser-native APIs (`navigator.mediaDevices.getUserMedia`) without introducing external heavy computer vision dependencies ahead of time.

### Core Capabilities
* **Browser-Native Camera Access**: Utilizes `navigator.mediaDevices.getUserMedia` preferring rear/environment cameras on mobile devices while allowing desktop fallbacks.
* **Strict Stream Lifecycle Management**: Media streams are created strictly on user trigger, attached to video viewports, and immediately destroyed (`track.stop()`) on modal close or unmount to protect user privacy and avoid hardware locks.
* **Resilient Permission & Error UX**: Gracefully handles permissions not requested, granted, denied, camera in use, camera not found, and unsupported environments with actionable guidance.
* **3x3 Alignment Reticle Guide**: An aesthetic glassmorphism HUD overlay with 4 corner brackets, 3x3 alignment grid, and target center color guidance for the active face.
* **6-Face Scan Session Flow**: Sequential workflow tracking faces $U \rightarrow R \rightarrow F \rightarrow D \rightarrow L \rightarrow B$ with retake, progress tracking, and step navigation.
* **High-Resolution Frame Capture**: Offscreen canvas utility capturing uncompressed video frames (`captureVideoFrame`) for future Phase 4B/4C computer vision pipelines.

---

## 2. Architecture & Data Flow

```
   ┌────────────────────────────────────────────────────────┐
   │                  User Trigger (UI)                     │
   │           "Scan Cube with Camera" Button               │
   └───────────────────────────┬────────────────────────────┘
                               │ Opens Scanner Modal
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │            CubeScannerModal / useCameraStream          │
   │  1. Check navigator.mediaDevices.getUserMedia          │
   │  2. Request permission with { facingMode: 'environment'}│
   │  3. Attach MediaStream to <video ref={videoRef} />     │
   │  4. Stream Status: 'requesting' ──► 'active'           │
   │     (Or 'denied' / 'unavailable' / 'error')            │
   └───────────────┬────────────────────────────┬───────────┘
                   │                            │
                   ▼                            ▼
   ┌──────────────────────────────┐  ┌──────────────────────┐
   │      ScanOverlayGuide        │  │   ScanFaceProgress   │
   │  - 3x3 Alignment Grid        │  │  - U, R, F, D, L, B  │
   │  - Target Face Indicator     │  │  - Captured Frames   │
   │  - Orientation Guidance      │  │  - Current Step Pill │
   └───────────────┬──────────────┘  └──────────────────────┘
                   │ User clicks Shutter
                   ▼
   ┌────────────────────────────────────────────────────────┐
   │                    frameCapture.js                     │
   │  - Draw video frame to high-res canvas                 │
   │  - Store captured frame in ScanSession                 │
   │  - Ready for future Phase 4B/4C computer vision        │
   └───────────────────────────┬────────────────────────────┘
                               │ Close / Cancel / Unmount
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │                   Stream Cleanup                       │
   │  - stream.getTracks().forEach(track => track.stop())   │
   │  - Clear video srcObject                               │
   │  - Camera hardware light turns OFF immediately         │
   └────────────────────────────────────────────────────────┘
```

---

## 3. Camera Permissions & Error Handling Matrix

| Status Code | Trigger Condition | User UI Message | Recovery Action |
| :--- | :--- | :--- | :--- |
| **`IDLE`** | Initial state / scanner closed | Scanner closed | Open scanner |
| **`REQUESTING`** | User opened scanner modal | "Requesting Camera Permission..." | Allow prompt in browser |
| **`ACTIVE`** | Permission granted & stream attached | Live video feed + HUD reticle | Capture frames |
| **`DENIED`** | `NotAllowedError` / `PermissionDeniedError` | "Camera Permission Denied. Click lock icon in address bar." | "Try Again" button |
| **`UNAVAILABLE`** | `NotFoundError` / `DevicesNotFoundError` | "No camera device found on this system." | Connect camera & Retry |
| **`UNAVAILABLE`** | `NotReadableError` / `TrackStartError` | "Camera is currently in use by another application." | Close other app & Retry |
| **`NOT_SUPPORTED`** | `navigator.mediaDevices` undefined | "Camera access is not supported by your browser." | Use supported browser |

---

## 4. Scan Session State Machine

```
              ┌────────────────┐
              │     READY      │ (Face = U, Index = 0)
              └───────┬────────┘
                      │ Shutter Click
                      ▼
              ┌────────────────┐
              │   CAPTURING    │ (frameCapture.js -> dataURL)
              └───────┬────────┘
                      │ Advance to next face (U -> R -> F -> D -> L -> B)
                      ▼
              ┌────────────────┐
              │   NEXT FACE    │ (Repeat until all 6 faces captured)
              └───────┬────────┘
                      │ Final face captured
                      ▼
              ┌────────────────┐
              │   COMPLETED    │ (Ready for Phase 4B CV Extraction)
              └────────────────┘
```

---

## 5. Phase 4B Integration Plan

In Phase 4B, the captured frames stored in `capturedFrames[face]` will be passed directly into:
1. **Contour & Grid Detection**: Automatically identify the 3x3 square boundary within the alignment box.
2. **Color Classification**: Sample the 9 facelet regions, classify RGB/HSV values into standard WCA colors ($U, R, F, D, L, B$).
3. **Canonical Assembly**: Reconstruct into the standard 54-character state string contract.
