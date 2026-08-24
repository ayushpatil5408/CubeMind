# 🧊 CubeMind

### Next-Generation Rubik's Cube Intelligence Platform

> An intelligent full-stack Rubik's Cube solver combining computer vision, 3D visualization, algorithmic solving, explainable coaching, move optimization, and interactive practice analytics.

[![Backend Tests](https://img.shields.io/badge/Backend%20Tests-211%2F211%20Passing-success)](#-testing)
[![Frontend Tests](https://img.shields.io/badge/Frontend%20Tests-126%2F126%20Passing-success)](#-testing)
[![Build](https://img.shields.io/badge/Production%20Build-Passing-success)](#-testing)
[![Python](https://img.shields.io/badge/Python-FastAPI-blue)](#-technology-stack)
[![React](https://img.shields.io/badge/React-Frontend-blue)](#-technology-stack)

---

## 🚀 What is CubeMind?

CubeMind is a high-performance, full-stack Rubik's Cube intelligence platform built to go beyond a traditional cube solver.

It allows users to:

- 🧊 Interact with a 3D Rubik's Cube
- 🎨 Manually enter cube colors
- 📷 Scan a physical cube using a camera
- 🔍 Validate whether a cube state is physically solvable
- 🧠 Generate a solution using the Kociemba Two-Phase algorithm
- ⚡ Optimize redundant moves with verification
- 🎬 Watch the solution through animated 3D playback
- 🤖 Learn through an explainable AI-style coaching system
- 🎯 Practice solution sequences interactively
- 📊 Track practice and solve history locally

---

## ✨ Key Features

### 🧠 Intelligent Solver Engine

- Kociemba Two-Phase solving algorithm
- Valid cube state verification before solving
- Structured solver output
- Solver analytics and execution metrics
- Fast solution generation

### 🛡️ Mathematical Cube Validation

CubeMind validates the physical consistency of a cube before attempting to solve it.

It detects:

- Invalid sticker and color counts
- Invalid edge orientation
- Invalid corner orientation
- Edge permutation parity errors
- Corner permutation parity errors
- Physically impossible cube states

---

### ⚡ Move Optimization

The solution optimization engine safely reduces redundant consecutive moves.

Examples:

```text
R R'   →  []
R R    →  R2
R R R  →  R'
R2 R2  →  []