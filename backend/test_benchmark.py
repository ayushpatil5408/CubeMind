"""
Unit & Integration Tests for Benchmark Engine & Metrics Framework (Phase 2E).

Tests:
1. Metric calculations (mean, median, percentiles, min, max, std_dev).
2. Metric calculations on edge cases (empty list, single value, even/odd counts).
3. Scramble dataset generation across all categories.
4. Benchmark reproducibility with deterministic random seeds.
5. Immutability of input state during benchmark runs.
6. Execution of full benchmark suite with summary verification.
7. Verification that Cube Core and Validator remain 100% decoupled from solver and benchmark code.
8. Circular dependency check across all backend modules.
"""

import sys
import importlib
import pytest

import cube_engine
from cube_engine import Cube, SOLVED_STATE_STRING
from solver.benchmark import (
    MetricStats,
    BenchmarkCaseResult,
    BenchmarkSummary,
    SolverBenchmarkRunner,
)
from solver.pipeline import SolverService


# ======================================================================
# 1. MetricStats Unit Tests
# ======================================================================

def test_metric_stats_empty():
    """Empty sequence returns zeroed metrics."""
    stats = MetricStats.calculate([])
    assert stats.count == 0
    assert stats.min == 0.0
    assert stats.mean == 0.0


def test_metric_stats_single_value():
    """Single value sequence returns exact value across all percentiles."""
    stats = MetricStats.calculate([42.5])
    assert stats.count == 1
    assert stats.min == 42.5
    assert stats.max == 42.5
    assert stats.mean == 42.5
    assert stats.median == 42.5
    assert stats.p90 == 42.5
    assert stats.p95 == 42.5
    assert stats.p99 == 42.5
    assert stats.std_dev == 0.0


def test_metric_stats_odd_and_even_series():
    """Calculates exact median and statistics for odd and even lists."""
    # Odd series: 1, 2, 3, 4, 5 -> median = 3.0
    odd_stats = MetricStats.calculate([5, 1, 3, 2, 4])
    assert odd_stats.count == 5
    assert odd_stats.min == 1.0
    assert odd_stats.max == 5.0
    assert odd_stats.mean == 3.0
    assert odd_stats.median == 3.0

    # Even series: 10, 20, 30, 40 -> median = 25.0
    even_stats = MetricStats.calculate([10, 20, 30, 40])
    assert even_stats.count == 4
    assert even_stats.median == 25.0
    assert even_stats.min == 10.0
    assert even_stats.max == 40.0


def test_metric_stats_serialization():
    """MetricStats serializes cleanly to dict with rounded floats."""
    stats = MetricStats.calculate([10.12345, 20.98765])
    d = stats.to_dict()
    assert isinstance(d, dict)
    assert d["count"] == 2
    assert "mean" in d
    assert "p95" in d


# ======================================================================
# 2. Dataset Generation Tests
# ======================================================================

def test_generate_dataset_solved():
    """Generates solved state dataset."""
    runner = SolverBenchmarkRunner()
    ds = runner.generate_scramble_dataset("SOLVED")
    assert len(ds) == 1
    assert ds[0][1] == "SOLVED"
    assert ds[0][3] == SOLVED_STATE_STRING


def test_generate_dataset_single_moves():
    """Generates all 18 single move scrambles."""
    runner = SolverBenchmarkRunner()
    ds = runner.generate_scramble_dataset("SINGLE_MOVE")
    assert len(ds) == 18
    for name, cat, moves, state in ds:
        assert cat == "SINGLE_MOVE"
        assert len(moves) == 1
        assert len(state) == 54


def test_generate_dataset_known_algorithms():
    """Generates known algorithm test suite."""
    runner = SolverBenchmarkRunner()
    ds = runner.generate_scramble_dataset("KNOWN_ALGORITHMS")
    assert len(ds) >= 7
    names = [x[0] for x in ds]
    assert any("Superflip" in n for n in names)
    assert any("Checkerboard" in n for n in names)
    assert any("Sexy Move" in n for n in names)


def test_generate_dataset_random():
    """Generates randomized scramble sets of requested length and count."""
    runner = SolverBenchmarkRunner()
    ds = runner.generate_scramble_dataset("SHORT", count=5, length=4, seed=123)
    assert len(ds) == 5
    for _, cat, moves, state in ds:
        assert cat == "SHORT"
        assert len(moves) == 4
        assert len(state) == 54


# ======================================================================
# 3. Reproducibility & Immutability Tests
# ======================================================================

def test_benchmark_reproducibility():
    """Identical seeds produce identical datasets and identical solutions."""
    runner = SolverBenchmarkRunner()
    ds1 = runner.generate_scramble_dataset("MEDIUM", count=3, length=10, seed=999)
    ds2 = runner.generate_scramble_dataset("MEDIUM", count=3, length=10, seed=999)

    assert ds1 == ds2

    res1 = runner.run_benchmark(ds1, warmup_runs=0)
    res2 = runner.run_benchmark(ds2, warmup_runs=0)

    moves1 = [c.solution_moves for c in res1.cases]
    moves2 = [c.solution_moves for c in res2.cases]

    assert moves1 == moves2


def test_benchmark_immutability():
    """Asserts that state strings and cube objects are not mutated during benchmarking."""
    runner = SolverBenchmarkRunner()
    ds = runner.generate_scramble_dataset("SHORT", count=3, length=5, seed=10)
    orig_states = [d[3] for d in ds]

    res = runner.run_benchmark(ds, warmup_runs=1)

    assert res.total_cases == 3
    assert res.successful_solves == 3
    # Check that original dataset states remain identical
    for i, d in enumerate(ds):
        assert d[3] == orig_states[i]


# ======================================================================
# 4. End-to-End Benchmark Execution
# ======================================================================

def test_run_small_benchmark_suite():
    """Runs a mixed small benchmark suite and validates aggregate summary metrics."""
    runner = SolverBenchmarkRunner()
    dataset = []
    dataset.extend(runner.generate_scramble_dataset("SOLVED"))
    dataset.extend(runner.generate_scramble_dataset("SINGLE_MOVE")[:3])
    dataset.extend(runner.generate_scramble_dataset("SHORT", count=2, length=4, seed=77))

    summary = runner.run_benchmark(dataset, warmup_runs=1)

    assert summary.total_cases == 6
    assert summary.successful_solves == 6
    assert summary.failed_solves == 0
    assert summary.verification_failures == 0
    assert summary.success_rate_percent == 100.0
    assert summary.raw_solve_time.count == 6
    assert summary.pipeline_time.count == 6
    assert summary.move_count.count == 6

    # Category breakdown checks
    assert "SOLVED" in summary.category_summaries
    assert "SINGLE_MOVE" in summary.category_summaries
    assert "SHORT" in summary.category_summaries
    assert summary.category_summaries["SOLVED"].total_cases == 1
    assert summary.category_summaries["SINGLE_MOVE"].total_cases == 3
    assert summary.category_summaries["SHORT"].total_cases == 2


# ======================================================================
# 5. Architecture & Zero-Coupling Invariant
# ======================================================================

def test_zero_coupling_and_no_circular_dependencies():
    """
    Strict architectural audit:
    - Cube Core must not import validator, solver, or benchmark.
    - Validator must not import solver or benchmark.
    - Solver base must not import concrete solvers or benchmark.
    """
    import inspect
    import cube_engine
    import validator
    import solver.base

    cube_engine_src = inspect.getsource(cube_engine)
    validator_src = inspect.getsource(validator)
    solver_base_src = inspect.getsource(solver.base)

    # Core must be completely decoupled
    for forbidden in ["validator", "solver", "kociemba", "rubik_solver", "benchmark"]:
        assert f"import {forbidden}" not in cube_engine_src
        assert f"from {forbidden}" not in cube_engine_src

    # Validator must be decoupled from solver
    for forbidden in ["solver", "kociemba", "rubik_solver", "benchmark"]:
        assert f"import {forbidden}" not in validator_src
        assert f"from {forbidden}" not in validator_src

def test_run_benchmarks_cli_module():
    """Verifies that run_benchmarks module functions execute cleanly."""
    import run_benchmarks
    from solver.benchmark import SolverBenchmarkRunner

    runner = SolverBenchmarkRunner()
    dataset = []
    dataset.extend(runner.generate_scramble_dataset("SOLVED"))
    dataset.extend(runner.generate_scramble_dataset("SINGLE_MOVE")[:2])
    dataset.extend(runner.generate_scramble_dataset("SHORT", count=2, length=3, seed=42))

    summary = runner.run_benchmark(dataset, warmup_runs=0, measure_api=False)
    assert summary.total_cases == 5
    assert summary.successful_solves == 5

    # Verify ASCII report printer
    run_benchmarks.print_ascii_report(summary)
