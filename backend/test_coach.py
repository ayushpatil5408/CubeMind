"""
Unit Tests for AI Solution Coach & Explainable Steps Engine (Phase 5B).
"""

import pytest
from solver.coach import (
    CoachMode,
    CoachingStep,
    RuleBasedExplainer,
    default_coach_explainer,
    KNOWN_PATTERNS,
)


class TestCoachExplanationGeneration:
    """Tests for individual and sequence move explanations."""

    def test_standard_clockwise_moves(self):
        explainer = RuleBasedExplainer()
        steps = explainer.explain_sequence(["R", "U", "F", "D", "L", "B"], mode=CoachMode.BEGINNER)

        assert len(steps) == 6
        assert steps[0].move == "R"
        assert steps[0].move_name == "Right Clockwise"
        assert steps[0].face_name == "Right"
        assert steps[0].face_color == "Red"
        assert steps[0].direction == "Clockwise (90°)"
        assert "Turn the Right face (Red) 90 degrees clockwise" in steps[0].instruction
        assert steps[0].hint is not None

    def test_prime_counter_clockwise_moves(self):
        explainer = RuleBasedExplainer()
        steps = explainer.explain_sequence(["R'", "U'"], mode=CoachMode.BEGINNER)

        assert len(steps) == 2
        assert steps[0].move == "R'"
        assert steps[0].move_name == "Right Inverted"
        assert steps[0].direction == "Counter-Clockwise (90°)"
        assert "90 degrees counter-clockwise" in steps[0].instruction

    def test_double_turn_moves(self):
        explainer = RuleBasedExplainer()
        steps = explainer.explain_sequence(["F2", "D2"], mode=CoachMode.BEGINNER)

        assert len(steps) == 2
        assert steps[0].move == "F2"
        assert steps[0].move_name == "Front Double Turn"
        assert steps[0].direction == "Double Turn (180°)"
        assert "180 degrees" in steps[0].instruction

    def test_compact_mode_output(self):
        explainer = RuleBasedExplainer()
        steps = explainer.explain_sequence(["R", "U'"], mode=CoachMode.COMPACT)

        assert len(steps) == 2
        assert steps[0].instruction == "Rotate Right (R) Clockwise (90°)."
        assert steps[0].hint is None  # Hints omitted in compact mode

    def test_empty_sequence_handling(self):
        explainer = RuleBasedExplainer()
        steps = explainer.explain_sequence([])
        assert steps == []


class TestPatternDetection:
    """Tests for conservative pattern and micro-algorithm recognition."""

    def test_sexy_move_pattern_detection(self):
        explainer = RuleBasedExplainer()
        moves = ["F", "R", "U", "R'", "U'", "F'"]
        steps = explainer.explain_sequence(moves)

        assert len(steps) == 6
        # Moves 1 to 4 should be marked as part of Sexy Move Trigger
        assert steps[1].pattern_name == "Sexy Move Trigger (Move 1/4)"
        assert steps[2].pattern_name == "Sexy Move Trigger (Move 2/4)"
        assert steps[3].pattern_name == "Sexy Move Trigger (Move 3/4)"
        assert steps[4].pattern_name == "Sexy Move Trigger (Move 4/4)"
        assert steps[1].pattern_confidence == 1.0

        # Unrelated moves should have no pattern
        assert steps[0].pattern_name is None
        assert steps[5].pattern_name is None

    def test_sune_pattern_detection(self):
        explainer = RuleBasedExplainer()
        sune_moves = ["R", "U", "R'", "U", "R", "U2", "R'"]
        steps = explainer.explain_sequence(sune_moves)

        assert len(steps) == 7
        for idx in range(7):
            assert steps[idx].pattern_name == f"Sune Orientation Sequence (Move {idx + 1}/7)"
            assert steps[idx].pattern_confidence == 1.0

    def test_prevents_false_positive_patterns(self):
        explainer = RuleBasedExplainer()
        arbitrary_moves = ["R", "D", "L'", "B2"]
        steps = explainer.explain_sequence(arbitrary_moves)

        for step in steps:
            assert step.pattern_name is None
            assert step.pattern_confidence is None
