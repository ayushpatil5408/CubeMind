"""
Unit and Integration Tests for Solution Optimizer & Analytics Engine (Phase 5A).
"""

import pytest
import cube_engine
from solver.optimizer import (
    SolutionOptimizer,
    OptimizationResult,
    OptimizationAnalytics,
    normalize_move,
    normalize_moves,
    reduce_same_face_moves,
    compute_solution_analytics,
)
from solver.kociemba import KociembaSolver
from solver.pipeline import SolverService


class TestMoveNormalization:
    """Tests for move parsing and canonical notation validation."""

    def test_valid_18_canonical_moves(self):
        for move in cube_engine.ALL_VALID_MOVES:
            assert normalize_move(move) == move
            assert normalize_move(f"  {move.lower()}  " if "'" not in move else f"  {move}  ") == move

    def test_normalize_moves_from_string_and_list(self):
        seq_str = "R U R' U' R2 F2"
        expected = ["R", "U", "R'", "U'", "R2", "F2"]
        assert normalize_moves(seq_str) == expected
        assert normalize_moves(expected) == expected

    def test_rejects_malformed_moves(self):
        invalid_tokens = ["X", "R3", "U''", "F-", "12", "ABC", ""]
        for bad in invalid_tokens:
            with pytest.raises(ValueError):
                normalize_move(bad)

    def test_rejects_non_string_types(self):
        with pytest.raises(TypeError):
            normalize_move(123)  # type: ignore


class TestRedundantMoveReduction:
    """Tests for same-face modular arithmetic reduction (mod 4)."""

    def test_inverse_cancellations(self):
        assert reduce_same_face_moves(["R", "R'"]) == []
        assert reduce_same_face_moves(["R'", "R"]) == []
        assert reduce_same_face_moves(["U", "U'"]) == []
        assert reduce_same_face_moves(["D'", "D"]) == []
        assert reduce_same_face_moves(["F", "F'"]) == []
        assert reduce_same_face_moves(["B'", "B"]) == []
        assert reduce_same_face_moves(["L", "L'"]) == []

    def test_double_turn_reductions(self):
        assert reduce_same_face_moves(["R", "R"]) == ["R2"]
        assert reduce_same_face_moves(["R'", "R'"]) == ["R2"]
        assert reduce_same_face_moves(["U", "U"]) == ["U2"]
        assert reduce_same_face_moves(["F'", "F'"]) == ["F2"]

    def test_four_turn_cancellations(self):
        assert reduce_same_face_moves(["R", "R", "R", "R"]) == []
        assert reduce_same_face_moves(["R'", "R'", "R'", "R'"]) == []
        assert reduce_same_face_moves(["R2", "R2"]) == []
        assert reduce_same_face_moves(["U2", "U", "U"]) == []
        assert reduce_same_face_moves(["U", "U", "U2"]) == []

    def test_three_turn_reductions(self):
        assert reduce_same_face_moves(["R", "R", "R"]) == ["R'"]
        assert reduce_same_face_moves(["R'", "R'", "R'"]) == ["R"]
        assert reduce_same_face_moves(["R2", "R"]) == ["R'"]
        assert reduce_same_face_moves(["R", "R2"]) == ["R'"]
        assert reduce_same_face_moves(["R2", "R'"]) == ["R"]
        assert reduce_same_face_moves(["R'", "R2"]) == ["R"]

    def test_cascading_multi_pass_cancellations(self):
        # F R (U U') R' F' -> F R R' F' -> F F' -> []
        seq = ["F", "R", "U", "U'", "R'", "F'"]
        assert reduce_same_face_moves(seq) == []

        # R U (D D') U' R -> R U U' R -> R R -> R2
        seq2 = ["R", "U", "D", "D'", "U'", "R"]
        assert reduce_same_face_moves(seq2) == ["R2"]

    def test_mixed_face_sequences_preserved(self):
        sexy_move = ["R", "U", "R'", "U'"]
        assert reduce_same_face_moves(sexy_move) == sexy_move

        t_perm = ["R", "U", "R'", "U'", "R'", "F", "R2", "U'", "R'", "U'", "R", "U", "R'", "F'"]
        assert reduce_same_face_moves(t_perm) == t_perm


class TestOptimizationSafetyAndVerification:
    """Tests for the formal state-equivalence verification gate."""

    def test_optimization_preserves_cube_state(self):
        scramble = ["R", "U", "R'", "U'", "F2", "D2", "L", "B"]
        cube = cube_engine.Cube()
        cube.apply_algorithm(scramble)

        # Sequence with redundant moves that solve the cube back
        redundant_solution = ["B'", "L'", "D2", "F2", "U", "R", "U'", "R'", "U", "U'", "R", "R'"]
        result = SolutionOptimizer.optimize(cube, redundant_solution)

        assert result.is_verified is True
        assert result.is_optimized is True
        assert len(result.optimized_moves) < len(result.original_moves)
        assert result.analytics.moves_saved == 4

        # Verify applying optimized moves solves the cube
        cube_test = cube.clone()
        cube_test.apply_algorithm(result.optimized_moves)
        assert cube_test.is_solved() is True

    def test_empty_and_already_solved_cube(self):
        cube = cube_engine.Cube()
        result = SolutionOptimizer.optimize(cube, [])
        assert result.is_verified is True
        assert result.is_optimized is False
        assert result.optimized_moves == []
        assert result.analytics.original_move_count == 0
        assert result.analytics.optimized_move_count == 0


class TestSolutionAnalytics:
    """Tests for solution metrics and statistics."""

    def test_analytics_computations(self):
        orig = ["R", "R", "U", "U'", "F2", "L'", "B"]
        opt = ["R2", "F2", "L'", "B"]

        analytics = compute_solution_analytics(orig, opt, solve_time_ms=15.5, opt_time_ms=0.5)

        assert analytics.original_move_count == 7
        assert analytics.optimized_move_count == 4
        assert analytics.moves_saved == 3
        assert analytics.optimization_percentage == pytest.approx(42.9, rel=1e-2)

        # Face distribution
        assert analytics.face_distribution["R"] == 1
        assert analytics.face_distribution["F"] == 1
        assert analytics.face_distribution["L"] == 1
        assert analytics.face_distribution["B"] == 1
        assert analytics.face_distribution["U"] == 0

        # Turn types
        assert analytics.half_turn_count == 2  # R2, F2
        assert analytics.prime_move_count == 1  # L'
        assert analytics.quarter_turn_count == 2  # L', B

        # Estimated playback durations
        assert analytics.estimated_duration_ms["1.0x"] == 4 * 380
        assert analytics.estimated_duration_ms["2.0x"] == 4 * 190
        assert analytics.solve_time_ms == 15.5
        assert analytics.optimization_time_ms == 0.5


class TestEndToEndSolverOptimizationIntegration:
    """Integration tests verifying full solve pipeline with optimization."""

    def test_kociemba_solver_pipeline_returns_optimized_solution(self):
        service = SolverService()
        scramble = ["R", "U", "R'", "U'"]
        cube = cube_engine.Cube()
        cube.apply_algorithm(scramble)

        result = service.solve(cube.to_state_string())

        assert result.success is True
        assert result.status == "SOLVED"
        assert result.is_optimized is not None
        assert result.original_moves is not None
        assert len(result.moves) > 0
        assert result.verification_result is not None
        assert result.verification_result.is_verified is True
        assert result.optimization_analytics is not None
        assert "face_distribution" in result.optimization_analytics
        assert "moves_saved" in result.optimization_analytics
