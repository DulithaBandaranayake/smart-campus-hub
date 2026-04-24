#!/bin/bash
# Project Cleanup Script (Bash)
# This script removes node_modules and other build artifacts to reset the environment.

echo "Starting project cleanup..."

targets=(
    "node_modules"
    "frontend/node_modules"
    "frontend/dist"
    "backend/target"
    "backend/data"
    ".eslintcache"
)

for target in "${targets[@]}"; do
    if [ -d "$target" ] || [ -f "$target" ]; then
        echo "Removing $target..."
        rm -rf "$target"
    fi
done

# Find and remove any other node_modules folders
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +

echo "Cleanup complete! Please run 'npm run install:all' to reinstall dependencies."
