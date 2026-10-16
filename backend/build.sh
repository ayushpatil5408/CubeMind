#!/usr/bin/env bash
# Render & cloud build script for CubeMind Backend
set -e

pip install --upgrade pip
pip install --no-cache-dir "future>=1.0.0"
pip install --no-cache-dir --no-deps "rubik-solver>=0.2.0"
pip install --no-cache-dir -r requirements.txt
