# Project Cleanup Script (PowerShell)
# This script removes node_modules and other build artifacts to reset the environment.

Write-Host "Starting project cleanup..." -ForegroundColor Cyan

$targets = @(
    "node_modules",
    "frontend/node_modules",
    "frontend/dist",
    "backend/target",
    "backend/data",
    ".eslintcache"
)

foreach ($target in $targets) {
    if (Test-Path $target) {
        Write-Host "Removing $target..." -ForegroundColor Yellow
        Remove-Item -Path $target -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Also find and remove any other node_modules folders deeper in the tree
Get-ChildItem -Path . -Recurse -Directory -Filter "node_modules" -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Removing $($_.FullName)..." -ForegroundColor Yellow
    Remove-Item -Path $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "Cleanup complete! Please run 'npm run install:all' to reinstall dependencies." -ForegroundColor Green
