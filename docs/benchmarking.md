# CubeMind Solver Benchmarking & Performance Specification

**Status**: IMPLEMENTED (Phase 2E)  
**Package**: `backend/solver/benchmark.py`  
**CLI Tool**: `backend/run_benchmarks.py`

---

## 1. Methodology & Measurement Definitions

CubeMind's benchmarking framework provides statistically rigorous, reproducible performance analysis of the Rubik's Cube solving system across multiple execution layers.

### Multi-Layer Timing Architecture

```text
Client (HTTP Request)
│
├── [1] API Overhead (HTTP parsing, FastAPI routing, Pydantic validation, JSON serialization)
│   │
│   └── [2] Pipeline Time (SolverService orchestration)
│       │   - CubeValidator.validate()
│       │   - Solved state check (is_solved)
│       │   - Solver selection (SolverRegistry)
│       │   │
│       │   ├── [3] Raw Solve Time (_solve_impl)
│       │   │   - State mapping (cubemind_to_kociemba_state)
│       │   │   - Kociemba Two-Phase IDA* search
│       │   │   - Move mapping (kociemba_to_cubemind_solution)
│       │   │
│       │   └── SolutionVerifier.verify() on cloned cube
│       │
│       └── Structured SolutionResult packaging
│
└── JSON HTTP Response
```

### Metrics Definitions

| Metric | Definition | Formula / Method |
| :--- | :--- | :--- |
| **Raw Solve Time** | Time spent inside `_solve_impl()` including state conversion and IDA* search | High-resolution `time.perf_counter()` delta |
| **Pipeline Time** | Total time for `SolverService.solve()` including validation, solving, and verification | `t_pipeline_end - t_pipeline_start` |
| **API Overhead** | HTTP request cycle time through FastAPI `TestClient` minus pipeline time | `t_api_total - t_pipeline` |
| **Move Count** | Total number of single-face turns ($U, D, L, R, F, B$, primes, double turns) | `len(solution_moves)` |
| **Success Rate** | Percentage of test cases resulting in status `SOLVED` or `ALREADY_SOLVED` | $\frac{\text{Successful Solves}}{\text{Total Cases}} \times 100\%$ |
| **Percentiles ($P_{90}, P_{95}, P_{99}$)** | Latency thresholds below which 90%, 95%, or 99% of runs complete | Nearest-rank percentile algorithm |

---

## 2. Test Scramble Categories

All benchmark states are generated strictly through legal move operations on a canonical Cube:

1. **`SOLVED`**: Baseline zero-move solved cube.
2. **`SINGLE_MOVE`**: Complete set of all 18 standard moves ($U, U', U2, D, D', D2, L, L', L2, R, R', R2, F, F', F2, B, B', B2$).
3. **`KNOWN_ALGORITHMS`**: Standard Rubik's Cube benchmarks:
   - Superflip (20 moves, God's Number maximum)
   - Sexy Move & Inverse Sexy (4 moves)
   - Sune & Anti-Sune (7 moves)
   - Checkerboard Pattern (6 moves)
   - T-Permutation (14 moves)
   - Cube in a Cube (16 moves)
4. **`SHORT`**: Randomized scrambles of length 5.
5. **`MEDIUM`**: Randomized scrambles of length 10–15.
6. **`LONG_WCA`**: Randomized full WCA-length scrambles of length 20.

---

## 3. Empirical Benchmark Results

*Measured on Intel Core i7 / Windows 64-bit / Python 3.11.9 without JIT compilation.*

### Overall Summary (42 Test Cases)

| Metric | Mean | Median | Min | Max | P90 | P95 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Raw Solve Time (ms)** | 756.64 | 1.17 | 0.10 | 7,693.97 | 3,709.89 | 4,142.56 |
| **Pipeline Time (ms)** | 756.74 | 1.27 | 0.12 | 7,694.16 | 3,710.10 | 4,142.70 |
| **API Total (ms)** | 734.42 | 13.68 | 7.22 | 7,525.20 | 3,713.44 | 4,072.14 |
| **Move Count** | 8.4 | 4.0 | 0 | 22 | 21.0 | 21.0 |

*Success Rate: **100.0%** (42/42 solved, 0 validation failures, 0 verification failures).*

### Category Breakdown

| Category | Cases | Raw Time (ms) | Pipeline Time (ms) | API Time (ms) | Avg Move Count | Success Rate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`SOLVED`** | 1 | 0.10 | 0.12 | 51.09 | 0.0 | 100% |
| **`SINGLE_MOVE`** | 18 | 89.50 | 89.58 | 11.73 | 1.0 | 100% |
| **`SHORT` (len=5)** | 5 | 4.42 | 4.52 | 12.87 | 9.4 | 100% |
| **`MEDIUM` (len=12)** | 5 | 735.24 | 735.39 | 720.07 | 18.8 | 100% |
| **`KNOWN_ALGORITHMS`** | 8 | 575.93 | 576.03 | 576.93 | 11.0 | 100% |
| **`LONG_WCA` (len=20)** | 5 | 4,372.41 | 4,372.57 | 4,460.62 | 21.2 | 100% |

---

## 4. How to Run Benchmarks

### CLI Execution
```powershell
# Standard run (5 cases per randomized category, measuring API overhead)
python backend/run_benchmarks.py --count 5 --seed 100

# Fast run skipping API layer
python backend/run_benchmarks.py --count 10 --no-api

# Output machine-readable JSON
python backend/run_benchmarks.py --json > benchmark_results.json
```

### Programmatic Execution
```python
from solver.benchmark import SolverBenchmarkRunner

runner = SolverBenchmarkRunner()
dataset = runner.generate_scramble_dataset("LONG_WCA", count=10, length=20, seed=42)
summary = runner.run_benchmark(dataset, warmup_runs=2, verify=True)

print(f"Success Rate: {summary.success_rate_percent}%")
print(f"Average Solve Time: {summary.raw_solve_time.mean:.2f} ms")
print(f"Average Move Count: {summary.move_count.mean:.1f} moves")
```

---

## 5. Feature Status & Roadmap

- [x] **IMPLEMENTED (Phase 2E)**: Reproducible multi-category scramble dataset generation.
- [x] **IMPLEMENTED (Phase 2E)**: Descriptive and percentile statistical calculations.
- [x] **IMPLEMENTED (Phase 2E)**: State immutability audit during benchmarking.
- [x] **IMPLEMENTED (Phase 2E)**: Multi-layer timing isolation (Raw vs Pipeline vs API).
- [x] **IMPLEMENTED (Phase 2E)**: Standalone CLI utility (`backend/run_benchmarks.py`).
- [ ] **PLANNED (Future)**: Comparative benchmarking across multiple solving engines (CFOP vs Kociemba vs IDA*).
- [ ] **PLANNED (Future)**: Asynchronous concurrent batch solving throughput benchmarks.
