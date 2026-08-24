"""
Benchmark Engine & Performance Metrics Framework (Phase 2E).

Provides reproducible, statistically sound benchmarking for:
1. Raw solving algorithms (Kociemba Two-Phase)
2. High-level orchestration pipeline (SolverService)
3. HTTP REST API endpoints (FastAPI / TestClient)
"""

from __future__ import annotations
from dataclasses import dataclass, field
import math
import time
from typing import Any, Callable, Dict, List, Optional, Sequence, Tuple, Union

import cube_engine
from cube_engine import Cube, ScrambleGenerator, SOLVED_STATE_STRING
from solver.models import SolutionResult, SolverStatus
from solver.pipeline import SolverService, default_solver_service


@dataclass
class MetricStats:
    """Statistical metrics for latency or move count measurements."""
    count: int = 0
    min: float = 0.0
    max: float = 0.0
    mean: float = 0.0
    median: float = 0.0
    p90: float = 0.0
    p95: float = 0.0
    p99: float = 0.0
    std_dev: float = 0.0

    @classmethod
    def calculate(cls, values: Sequence[float]) -> MetricStats:
        """Calculates descriptive statistics and percentiles from a series of values."""
        if not values:
            return cls()

        sorted_vals = sorted(values)
        n = len(sorted_vals)
        mean_val = sum(sorted_vals) / n
        min_val = sorted_vals[0]
        max_val = sorted_vals[-1]

        # Median
        if n % 2 == 1:
            median_val = sorted_vals[n // 2]
        else:
            median_val = (sorted_vals[n // 2 - 1] + sorted_vals[n // 2]) / 2.0

        # Percentiles (Nearest rank method)
        def percentile(p: float) -> float:
            if n == 1:
                return sorted_vals[0]
            idx = int(math.ceil((p / 100.0) * n)) - 1
            idx = max(0, min(idx, n - 1))
            return sorted_vals[idx]

        p90_val = percentile(90.0)
        p95_val = percentile(95.0)
        p99_val = percentile(99.0)

        # Sample standard deviation
        if n > 1:
            variance = sum((x - mean_val) ** 2 for x in sorted_vals) / (n - 1)
            std_dev_val = math.sqrt(variance)
        else:
            std_dev_val = 0.0

        return cls(
            count=n,
            min=min_val,
            max=max_val,
            mean=mean_val,
            median=median_val,
            p90=p90_val,
            p95=p95_val,
            p99=p99_val,
            std_dev=std_dev_val,
        )

    def to_dict(self) -> Dict[str, float]:
        return {
            "count": self.count,
            "min": round(self.min, 3),
            "max": round(self.max, 3),
            "mean": round(self.mean, 3),
            "median": round(self.median, 3),
            "p90": round(self.p90, 3),
            "p95": round(self.p95, 3),
            "p99": round(self.p99, 3),
            "std_dev": round(self.std_dev, 3),
        }


@dataclass
class BenchmarkCaseResult:
    """Individual execution result for a single benchmark test case."""
    name: str
    category: str
    scramble_moves: List[str]
    initial_state: str
    success: bool
    status: str
    move_count: int
    solution_moves: List[str]
    raw_solve_time_ms: float
    pipeline_time_ms: float
    api_time_ms: Optional[float] = None
    is_verified: bool = False
    validation_status: str = "VALID"
    error_message: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "category": self.category,
            "scramble": " ".join(self.scramble_moves),
            "success": self.success,
            "status": self.status,
            "move_count": self.move_count,
            "solution": " ".join(self.solution_moves),
            "raw_solve_time_ms": round(self.raw_solve_time_ms, 3),
            "pipeline_time_ms": round(self.pipeline_time_ms, 3),
            "api_time_ms": round(self.api_time_ms, 3) if self.api_time_ms is not None else None,
            "is_verified": self.is_verified,
            "validation_status": self.validation_status,
            "error_message": self.error_message,
        }


@dataclass
class BenchmarkSummary:
    """Aggregated benchmark statistics and metrics across test runs."""
    total_cases: int = 0
    successful_solves: int = 0
    failed_solves: int = 0
    verification_failures: int = 0
    validation_failures: int = 0
    success_rate_percent: float = 0.0

    raw_solve_time: MetricStats = field(default_factory=MetricStats)
    pipeline_time: MetricStats = field(default_factory=MetricStats)
    api_time: Optional[MetricStats] = None
    move_count: MetricStats = field(default_factory=MetricStats)

    cases: List[BenchmarkCaseResult] = field(default_factory=list)
    category_summaries: Dict[str, BenchmarkSummary] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "total_cases": self.total_cases,
            "successful_solves": self.successful_solves,
            "failed_solves": self.failed_solves,
            "verification_failures": self.verification_failures,
            "validation_failures": self.validation_failures,
            "success_rate_percent": round(self.success_rate_percent, 2),
            "raw_solve_time_ms": self.raw_solve_time.to_dict(),
            "pipeline_time_ms": self.pipeline_time.to_dict(),
            "api_time_ms": self.api_time.to_dict() if self.api_time else None,
            "move_count": self.move_count.to_dict(),
            "category_summaries": {k: v.to_dict() for k, v in self.category_summaries.items()},
        }


class SolverBenchmarkRunner:
    """
    Executes standardized, reproducible benchmark suites.
    """

    KNOWN_ALGORITHMS: Dict[str, str] = {
        "Superflip (20 moves)": "U R2 F B R B2 R U2 L B2 R U' D' R2 F R' L B2 U2 F2",
        "Sexy Move (4 moves)": "R U R' U'",
        "Inverse Sexy (4 moves)": "U R U' R'",
        "Sune (7 moves)": "R U R' U R U2 R'",
        "Anti-Sune (7 moves)": "R U2 R' U' R U' R'",
        "Checkerboard (6 moves)": "U2 D2 F2 B2 L2 R2",
        "T-Permutation (14 moves)": "R U R' U' R' F R2 U' R' U' R U R' F'",
        "Cube in a Cube (16 moves)": "F L F U' R U F2 L2 U' L' B D' B' L2 U",
    }

    def __init__(self, service: Optional[SolverService] = None):
        self.service: SolverService = service or default_solver_service

    @classmethod
    def generate_scramble_dataset(
        cls,
        category: str,
        count: int = 10,
        length: int = 20,
        seed: Optional[int] = 42,
    ) -> List[Tuple[str, str, List[str], str]]:
        """
        Generates a named scramble dataset.
        Returns: List of tuples: (test_name, category, scramble_moves, state_string)
        """
        dataset: List[Tuple[str, str, List[str], str]] = []
        cat_upper = category.upper()

        if cat_upper == "SOLVED":
            dataset.append(("Solved Cube", "SOLVED", [], SOLVED_STATE_STRING))
            return dataset

        elif cat_upper == "SINGLE_MOVE":
            for move in ["U", "U'", "U2", "D", "D'", "D2", "L", "L'", "L2", "R", "R'", "R2", "F", "F'", "F2", "B", "B'", "B2"]:
                cube = Cube().apply_move(move)
                dataset.append((f"Single Move ({move})", "SINGLE_MOVE", [move], cube.to_state_string()))
            return dataset

        elif cat_upper == "KNOWN_ALGORITHMS":
            for name, algo in cls.KNOWN_ALGORITHMS.items():
                cube = Cube().apply_algorithm(algo)
                dataset.append((name, "KNOWN_ALGORITHMS", algo.split(), cube.to_state_string()))
            return dataset

        # Random or seeded sequences of specified length
        for i in range(count):
            case_seed = (seed + i) if seed is not None else None
            scramble = ScrambleGenerator.generate(length=length, seed=case_seed)
            cube = Cube().apply_algorithm(scramble)
            dataset.append((
                f"{cat_upper} Scramble #{i+1} (len={length}, seed={case_seed})",
                cat_upper,
                scramble,
                cube.to_state_string(),
            ))

        return dataset

    def run_benchmark(
        self,
        dataset: List[Tuple[str, str, List[str], str]],
        solver_name: str = "kociemba",
        warmup_runs: int = 2,
        verify: bool = True,
        measure_api: bool = False,
        api_client: Optional[Any] = None,
    ) -> BenchmarkSummary:
        """
        Executes benchmark on dataset with optional warmup and API overhead measurement.
        """
        # 1. Warm-up runs to ensure JIT/bytecode cache is primed
        if warmup_runs > 0 and dataset:
            warmup_state = dataset[0][3]
            for _ in range(warmup_runs):
                self.service.solve(warmup_state, solver_name=solver_name, verify=verify)

        # 2. Main benchmark loop
        case_results: List[BenchmarkCaseResult] = []

        for name, category, scramble_moves, state_string in dataset:
            # Immutability baseline copy
            initial_state_copy = str(state_string)

            # Measure full pipeline time
            t_pipe_start = time.perf_counter()
            sol_result: SolutionResult = self.service.solve(
                state_string,
                solver_name=solver_name,
                verify=verify,
            )
            t_pipe_end = time.perf_counter()
            pipeline_time_ms = (t_pipe_end - t_pipe_start) * 1000.0

            # Verify original state was not mutated
            assert state_string == initial_state_copy, f"State mutation detected during benchmark of '{name}'!"

            # Optional API measurement
            api_time_ms: Optional[float] = None
            if measure_api and api_client is not None:
                t_api_start = time.perf_counter()
                resp = api_client.post("/solve", json={"state_string": state_string, "solver": solver_name, "verify": verify})
                t_api_end = time.perf_counter()
                if resp.status_code == 200:
                    api_time_ms = (t_api_end - t_api_start) * 1000.0

            is_verified = bool(sol_result.verification_result and sol_result.verification_result.is_verified)
            val_status = sol_result.validation_result.status.value if sol_result.validation_result else "UNKNOWN"

            case_results.append(BenchmarkCaseResult(
                name=name,
                category=category,
                scramble_moves=scramble_moves,
                initial_state=state_string,
                success=sol_result.success,
                status=sol_result.status.value,
                move_count=sol_result.move_count,
                solution_moves=sol_result.moves,
                raw_solve_time_ms=sol_result.solve_time_ms,
                pipeline_time_ms=pipeline_time_ms,
                api_time_ms=api_time_ms,
                is_verified=is_verified,
                validation_status=val_status,
                error_message=sol_result.error_message,
            ))

        # 3. Aggregate metrics
        return self._aggregate_summary(case_results)

    def _aggregate_summary(
        self,
        cases: List[BenchmarkCaseResult],
        include_categories: bool = True,
    ) -> BenchmarkSummary:
        """Aggregates a list of BenchmarkCaseResult objects into structured statistics."""
        if not cases:
            return BenchmarkSummary()

        total = len(cases)
        successful = sum(1 for c in cases if c.success)
        failed = total - successful
        ver_failures = sum(1 for c in cases if c.success and not c.is_verified)
        val_failures = sum(1 for c in cases if c.validation_status != "VALID")
        success_rate = (successful / total) * 100.0 if total > 0 else 0.0

        raw_times = [c.raw_solve_time_ms for c in cases if c.success]
        pipe_times = [c.pipeline_time_ms for c in cases]
        move_counts = [float(c.move_count) for c in cases if c.success]

        api_times = [c.api_time_ms for c in cases if c.api_time_ms is not None]
        api_stats = MetricStats.calculate(api_times) if api_times else None

        # Per category grouping
        cat_summaries: Dict[str, BenchmarkSummary] = {}
        if include_categories:
            categories = sorted(list({c.category for c in cases}))
            for cat in categories:
                cat_cases = [c for c in cases if c.category == cat]
                cat_summaries[cat] = self._aggregate_summary(cat_cases, include_categories=False)

        return BenchmarkSummary(
            total_cases=total,
            successful_solves=successful,
            failed_solves=failed,
            verification_failures=ver_failures,
            validation_failures=val_failures,
            success_rate_percent=success_rate,
            raw_solve_time=MetricStats.calculate(raw_times),
            pipeline_time=MetricStats.calculate(pipe_times),
            api_time=api_stats,
            move_count=MetricStats.calculate(move_counts),
            cases=cases,
            category_summaries=cat_summaries,
        )
