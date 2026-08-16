# Create the project virtualenv. System Python is used only for this step.
param()

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $root

$venvDir = Join-Path $root ".venv"
$venvPython = Join-Path $venvDir "Scripts\python.exe"
if (-not (Test-Path -LiteralPath $venvPython)) {
    $venvPython = Join-Path $venvDir "bin\python"
}

if (Test-Path -LiteralPath $venvPython) {
    Write-Host "Virtualenv already present:"
    Write-Host "  $venvPython"
    & $venvPython -c "import sys; print(sys.version)"
    exit 0
}

function Find-BootstrapPython {
    $py = Get-Command py -ErrorAction SilentlyContinue
    if ($py) { return @{ File = $py.Source; Prefix = @("-3") } }
    foreach ($name in @("python", "python3")) {
        $cmd = Get-Command $name -ErrorAction SilentlyContinue
        if ($cmd) { return @{ File = $cmd.Source; Prefix = @() } }
    }
    throw "No system Python found to create .venv. Install Python 3, then re-run tools\bootstrap.ps1."
}

$boot = Find-BootstrapPython
Write-Host "Creating .venv with $($boot.File) (bootstrap only)..."
& $boot.File @($boot.Prefix + @("-m", "venv", $venvDir))
if ($LASTEXITCODE -ne 0) { throw "venv creation failed." }

if (-not (Test-Path -LiteralPath $venvPython)) {
    $venvPython = Join-Path $venvDir "Scripts\python.exe"
}
if (-not (Test-Path -LiteralPath $venvPython)) {
    throw "venv was created but python.exe was not found under .venv."
}

$requirements = Join-Path $root "requirements.txt"
$pins = @()
if (Test-Path -LiteralPath $requirements) {
    $pins = Get-Content -LiteralPath $requirements |
        Where-Object { $_ -match "\S" -and $_ -notmatch "^\s*#" }
}
if ($pins.Count -gt 0) {
    Write-Host "Installing requirements.txt into .venv..."
    & $venvPython -m pip install -r $requirements
    if ($LASTEXITCODE -ne 0) { throw "pip install failed." }
}

Write-Host "Virtualenv ready:"
Write-Host "  $venvPython"
Write-Host "Preview with:  pwsh -File tools\serve.ps1"
