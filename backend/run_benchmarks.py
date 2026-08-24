"""
Standalone Benchmark Runner for CubeMind Solver & API (Phase 2E).

Usage:
    python backend/run_benchmarks.py [--count N] [--seed S] [--measure-api] [--json]
"""

from __future__ import annotations
import argparse
import json
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from main import app
from solver.benchmark import SolverBenchmarkRunner, BenchmarkSummary


def run_full_suite(
    count_per_category: int = 10,
    base_seed: int = 100,
    measure_api: bool = True,
    warmup: int = 3,
) -> BenchmarkSummary:
    """Runs a complete standardized benchmark suite across all categories."""
    runner = SolverBenchmarkRunner()
    api_client = TestClient(app) if measure_api else None

    # Construct complete dataset
    full_dataset = []
    full_dataset.extend(runner.generate_scramble_dataset("SOLVED"))
    full_dataset.extend(runner.generate_scramble_dataset("SINGLE_MOVE"))
    full_dataset.extend(runner.generate_scramble_dataset("KNOWN_ALGORITHMS"))
    full_dataset.extend(runner.generate_scramble_dataset("SHORT", count=count_per_category, length=5, seed=base_seed))
    full_dataset.extend(runner.generate_scramble_dataset("MEDIUM", count=count_per_category, length=12, seed=base_seed + 100))
    full_dataset.extend(runner.generate_scramble_dataset("LONG_WCA", count=count_per_category, length=20, seed=base_seed + 200))

    summary = runner.run_benchmark(
        dataset=full_dataset,
        solver_name="kociemba",
        warmup_runs=warmup,
        verify=True,
        measure_api=measure_api,
        api_client=api_client,
    )

    return summary


def print_ascii_report(summary: BenchmarkSummary):
    """Formats and prints a detailed ASCII benchmark report."""
    print("=" * 78)
    print(" CUBEMIND SOLVER & PIPELINE PERFORMANCE BENCHMARK REPORT (PHASE 2E)")
    print("=" * 78)
    print(f" Total Test Cases       : {summary.total_cases}")
    print(f" Successful Solves      : {summary.successful_solves} ({summary.success_rate_percent:.1f}%)")
    print(f" Failed Solves          : {summary.failed_solves}")
    print(f" Verification Failures  : {summary.verification_failures}")
    print(f" Validation Failures    : {summary.validation_failures}")
    print("-" * 78)

    print("\nOVERALL LATENCY & MOVE METRICS:")
    print(f"{'Metric':<20} | {'Mean':<9} | {'Median':<9} | {'Min':<9} | {'Max':<9} | {'P90':<9} | {'P95':<9}")
    print("-" * 78)
    r = summary.raw_solve_time
    print(f"{'Raw Solve (ms)':<20} | {r.mean:<9.2f} | {r.median:<9.2f} | {r.min:<9.2f} | {r.max:<9.2f} | {r.p90:<9.2f} | {r.p95:<9.2f}")
    p = summary.pipeline_time
    print(f"{'Pipeline (ms)':<20} | {p.mean:<9.2f} | {p.median:<9.2f} | {p.min:<9.2f} | {p.max:<9.2f} | {p.p90:<9.2f} | {p.p95:<9.2f}")
    if summary.api_time:
        a = summary.api_time
        print(f"{'API Total (ms)':<20} | {a.mean:<9.2f} | {a.median:<9.2f} | {a.min:<9.2f} | {a.max:<9.2f} | {a.p90:<9.2f} | {a.p95:<9.2f}")
    m = summary.move_count
    print(f"{'Move Count':<20} | {m.mean:<9.1f} | {m.median:<9.1f} | {int(m.min):<9} | {int(m.max):<9} | {m.p90:<9.1f} | {m.p95:<9.1f}")
    print("-" * 78)

    print("\nPER-CATEGORY PERFORMANCE BREAKDOWN:")
    print(f"{'Category':<18} | {'Cases':<5} | {'Raw (ms)':<9} | {'Pipe (ms)':<9} | {'API (ms)':<9} | {'Avg Moves':<9} | {'Success':<7}")
    print("-" * 78)
    for cat_name, cat in summary.category_summaries.items():
        api_str = f"{cat.api_time.mean:.2f}" if cat.api_time else "N/A"
        print(
            f"{cat_name:<18} | {cat.total_cases:<5} | {cat.raw_solve_time.mean:<9.2f} | "
            f"{cat.pipeline_time.mean:<9.2f} | {api_str:<9} | {cat.move_count.mean:<9.1f} | {cat.success_rate_percent:>5.1f}%"
        )
    print("=" * 78)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CubeMind Solver Benchmark Runner")
    parser.add_argument("--count", type=int, default=10, help="Scrambles per randomized category")
    parser.add_argument("--seed", type=int, default=100, help="Base random seed for reproducibility")
    parser.add_argument("--no-api", action="store_true", help="Skip HTTP API overhead measurement")
    parser.add_argument("--warmup", type=int, default=3, help="Number of warmup iterations")
    parser.add_argument("--json", action="store_true", help="Output JSON results")

    args = parser.parse_args()

    results = run_full_suite(
        count_per_category=args.count,
        base_seed=args.seed,
        measure_api=not args.no_api,
        warmup=args.warmup,
    )

    if args.json:
        print(json.dumps(results.to_dict(), indent=2))
    else:
        print_ascii_report(results)
