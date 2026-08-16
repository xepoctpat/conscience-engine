# Idempotent preview start for session hooks and agents.
# Always uses the project .venv via tools/serve.ps1. Never global Python.
param(
    [int]$Port = 18780
)

$ErrorActionPreference = "Stop"
$serve = Join-Path $PSScriptRoot "serve.ps1"
& $serve -Port $Port -Detach
