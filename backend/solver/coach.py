"""
AI Solution Coach & Explainable Steps Engine (Phase 5B).

Provides deterministic, beginner-friendly explanations for Rubik's Cube move sequences:
- Factual move breakdown (face, rotation direction, turn angle).
- Beginner and Compact explanation modes.
- Conservative pattern recognition (micro-algorithms & triggers).
- Extensible architecture supporting future Generative AI backends.
"""

from __future__ import annotations
import abc
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional, Sequence, Tuple


class CoachMode(str, Enum):
    BEGINNER = "BEGINNER"
    COMPACT = "COMPACT"


FACE_DETAILS: Dict[str, Dict[str, str]] = {
    "U": {
        "name": "Up",
        "color": "White",
        "grip": "Hold with White on top. Use your index finger to flick the top layer.",
    },
    "R": {
        "name": "Right",
        "color": "Red",
        "grip": "Grip the left side; rotate the right layer with your right wrist.",
    },
    "F": {
        "name": "Front",
        "color": "Green",
        "grip": "Turn the front face facing you clockwise or counter-clockwise.",
    },
    "D": {
        "name": "Down",
        "color": "Yellow",
        "grip": "Keep Yellow on bottom. Use your ring or pinky finger to turn the bottom layer.",
    },
    "L": {
        "name": "Left",
        "color": "Orange",
        "grip": "Grip the right side; rotate the left layer with your left wrist.",
    },
    "B": {
        "name": "Back",
        "color": "Blue",
        "grip": "Turn the rear face using your index or middle finger from behind.",
    },
}

# Conservative, exact pattern library
KNOWN_PATTERNS: List[Tuple[str, List[str], str]] = [
    (
        "Sexy Move Trigger",
        ["R", "U", "R'", "U'"],
        "A foundational 4-move trigger cycling top-right corner and edge pieces.",
    ),
    (
        "Inverse Sexy Move",
        ["U", "R", "U'", "R'"],
        "An inverse 4-move trigger used in F2L piece pairing.",
    ),
    (
        "Left Sexy Move",
        ["L'", "U'", "L", "U"],
        "Mirrored left-handed 4-move trigger cycling top-left pieces.",
    ),
    (
        "Sune Orientation Sequence",
        ["R", "U", "R'", "U", "R", "U2", "R'"],
        "Standard corner orientation sequence preserving bottom layers.",
    ),
    (
        "Anti-Sune Sequence",
        ["R", "U2", "R'", "U'", "R", "U'", "R'"],
        "Inverse corner orientation sequence preserving bottom layers.",
    ),
    (
        "T-Perm Sequence",
        ["R", "U", "R'", "U'", "R'", "F", "R2", "U'", "R'", "U'", "R", "U", "R'", "F'"],
        "Corner-edge swap permutation algorithm.",
    ),
]


@dataclass
class CoachingStep:
    """
    Structured explainable coaching step for a single move in a solution.
    """
    step_number: int
    total_steps: int
    move: str
    move_name: str
    face_name: str
    face_color: str
    direction: str
    turn_type: str
    instruction: str
    explanation: str
    hint: Optional[str] = None
    pattern_name: Optional[str] = None
    pattern_confidence: Optional[float] = None
    playback_index: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "step_number": self.step_number,
            "total_steps": self.total_steps,
            "move": self.move,
            "move_name": self.move_name,
            "face_name": self.face_name,
            "face_color": self.face_color,
            "direction": self.direction,
            "turn_type": self.turn_type,
            "instruction": self.instruction,
            "explanation": self.explanation,
            "hint": self.hint,
            "pattern_name": self.pattern_name,
            "pattern_confidence": self.pattern_confidence,
            "playback_index": self.playback_index,
        }


class CoachExplainer(abc.ABC):
    """
    Abstract interface for AI Coach explanation engines.
    Allows rule-based and future generative AI implementations.
    """

    @abc.abstractmethod
    def explain_sequence(
        self,
        moves: Sequence[str],
        mode: CoachMode = CoachMode.BEGINNER,
    ) -> List[CoachingStep]:
        """Generates structured coaching steps for a sequence of moves."""
        raise NotImplementedError


class RuleBasedExplainer(CoachExplainer):
    """
    Deterministic rule-based explanation engine.
    Derives clear factual descriptions, beginner guidance, and pattern detections without external APIs.
    """

    @classmethod
    def _detect_patterns(cls, moves: Sequence[str]) -> Dict[int, Tuple[str, float]]:
        """
        Scans move sequence for exact sub-sequence pattern matches.
        Returns a mapping from step index to (pattern_name, confidence).
        """
        pattern_matches: Dict[int, Tuple[str, float]] = {}
        move_list = list(moves)
        n = len(move_list)

        for pat_name, pat_seq, _ in KNOWN_PATTERNS:
            k = len(pat_seq)
            if k > n:
                continue

            for start_idx in range(n - k + 1):
                if move_list[start_idx : start_idx + k] == pat_seq:
                    for offset in range(k):
                        idx = start_idx + offset
                        pattern_matches[idx] = (
                            f"{pat_name} (Move {offset + 1}/{k})",
                            1.0,
                        )

        return pattern_matches

    def explain_sequence(
        self,
        moves: Sequence[str],
        mode: CoachMode = CoachMode.BEGINNER,
    ) -> List[CoachingStep]:
        """
        Generates structured coaching steps for a validated move sequence.
        """
        if not moves:
            return []

        move_list = list(moves)
        total_steps = len(move_list)
        pattern_map = self._detect_patterns(move_list)
        coaching_steps: List[CoachingStep] = []

        for idx, move in enumerate(move_list):
            face_char = move[0].upper()
            face_info = FACE_DETAILS.get(
                face_char,
                {"name": face_char, "color": "Standard", "grip": "Turn the indicated face."},
            )

            # Analyze turn direction & angle
            if "2" in move:
                direction = "Double Turn (180°)"
                turn_type = "Half Turn (180°)"
                dir_desc = "180 degrees (half turn)"
                move_title = f"{face_info['name']} Double Turn"
            elif "'" in move:
                direction = "Counter-Clockwise (90°)"
                turn_type = "Quarter Turn (90°)"
                dir_desc = "90 degrees counter-clockwise (inverted)"
                move_title = f"{face_info['name']} Inverted"
            else:
                direction = "Clockwise (90°)"
                turn_type = "Quarter Turn (90°)"
                dir_desc = "90 degrees clockwise"
                move_title = f"{face_info['name']} Clockwise"

            # Instruction and explanation based on mode
            if mode == CoachMode.COMPACT:
                instruction = f"Rotate {face_info['name']} ({face_char}) {direction}."
                explanation = f"Repositions {face_info['name'].lower()} facelet orbits."
                hint = None
            else:
                instruction = (
                    f"Turn the {face_info['name']} face ({face_info['color']}) {dir_desc}."
                )
                explanation = (
                    f"This move repositions pieces on the {face_info['name'].lower()} layer "
                    f"towards their target solved positions without disturbing center alignment."
                )
                hint = face_info["grip"]

            pat_info = pattern_map.get(idx)
            pat_name = pat_info[0] if pat_info else None
            pat_conf = pat_info[1] if pat_info else None

            step = CoachingStep(
                step_number=idx + 1,
                total_steps=total_steps,
                move=move,
                move_name=move_title,
                face_name=face_info["name"],
                face_color=face_info["color"],
                direction=direction,
                turn_type=turn_type,
                instruction=instruction,
                explanation=explanation,
                hint=hint,
                pattern_name=pat_name,
                pattern_confidence=pat_conf,
                playback_index=idx,
            )
            coaching_steps.append(step)

        return coaching_steps


# Default explainer instance
default_coach_explainer = RuleBasedExplainer()
